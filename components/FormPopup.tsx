'use client';

import { token } from '@/sanity/env';
import { createClient } from '@sanity/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// Create a new client instance with write permissions
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

interface FormPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationProps {
  countdown: number;
}

const RefreshNotification = ({ countdown }: NotificationProps) => (
  <div className="fixed bottom-5 right-5 bg-white rounded-xl shadow-lg p-4 animate-popup">
    <p className="text-sm text-gray-600">
      Card posted successfully! Page will refresh in {countdown} seconds...
    </p>
    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
      <div
        className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
        style={{ width: `${(countdown / 10) * 100}%` }}
      />
    </div>
  </div>
);

const FormPopup = ({ isOpen, onClose }: FormPopupProps) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showRefreshNotification, setShowRefreshNotification] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [errors, setErrors] = useState<{
    repoUrl?: string;
    thoughts?: string;
    rating?: string;
    rateLimit?: string;
  }>({});

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRefreshNotification && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showRefreshNotification, countdown]);

  if (!isOpen) return null;

  const checkUrlExists = async (url: string) => {
    const existingCard = await writeClient.fetch(`*[_type == "card" && url == $url][0]`, { url });
    return !!existingCard;
  };

  const checkRateLimit = async (userId: string) => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const recentPost = await writeClient.fetch(
      `*[_type == "card" && user->userId == $userId && postedAt > $oneMinuteAgo][0]`,
      { userId, oneMinuteAgo }
    );
    return !!recentPost;
  };

  const checkUserBlocked = async (userId: string) => {
    const user = await writeClient.fetch(`*[_type == "user" && userId == $userId][0]{isBlocked}`, {
      userId,
    });
    return user?.isBlocked;
  };

  const getBlacklistedWords = async () => {
    const blacklist = await writeClient.fetch(
      `*[_type == "blacklist" && _id == "blacklistConfig"][0].words[].word`
    );
    return blacklist?.map((word: string) => word.toLowerCase()) || [];
  };

  const containsBlacklistedWords = (text: string, blacklistedWords: string[]) => {
    const normalizedText = text.toLowerCase();
    return blacklistedWords.some((word) => normalizedText.includes(word.toLowerCase()));
  };

  const blockUser = async (userId: string, reason: string) => {
    const user = await writeClient.fetch(`*[_type == "user" && userId == $userId][0]`, { userId });
    if (user) {
      await writeClient.patch(user._id).set({ isBlocked: true, blockReason: reason }).commit();
    }
  };

  const validateForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const repoUrlInput = form.elements.namedItem('repoUrl') as HTMLInputElement;
    const thoughtsInput = form.elements.namedItem('thoughts') as HTMLTextAreaElement;
    const newErrors: typeof errors = {};

    if (session?.user?.id) {
      // Check if user is blocked
      const isBlocked = await checkUserBlocked(session.user.id);
      if (isBlocked) {
        newErrors.rateLimit = 'Your account has been blocked from posting';
        setErrors(newErrors);
        return;
      }

      // Check for blacklisted words
      const blacklistedWords = await getBlacklistedWords();
      const textToCheck = `${thoughtsInput.value} ${repoUrlInput.value}`;

      if (containsBlacklistedWords(textToCheck, blacklistedWords)) {
        await blockUser(session.user.id, 'Automatic block due to use of blacklisted words');
        newErrors.thoughts = 'Your submission contains inappropriate content';
        setErrors(newErrors);
        return;
      }
    }

    // Check rate limit if user is logged in
    if (session?.user?.id) {
      const isRateLimited = await checkRateLimit(session.user.id);
      if (isRateLimited) {
        newErrors.rateLimit = 'Please wait 1 minute before posting again';
        setErrors(newErrors);
        return;
      }
    }

    // Validate Repository URL
    if (!repoUrlInput.value.startsWith('https://github.com/')) {
      newErrors.repoUrl = 'Please enter a valid GitHub repository URL';
    } else {
      // Check if URL already exists
      const urlExists = await checkUrlExists(repoUrlInput.value);
      if (urlExists) {
        newErrors.repoUrl = 'This repository has already been rated';
      }
    }

    // Validate Thoughts
    if (thoughtsInput.value.trim().length === 0) {
      newErrors.thoughts = 'Please share your thoughts';
    } else if (thoughtsInput.value.length > 150) {
      newErrors.thoughts = 'Thoughts must be 150 characters or less';
    }

    // Validate Rating
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    // If there are errors, set them and prevent form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    try {
      let userRef = null;
      if (session?.user) {
        const existingUser = await writeClient.fetch(`*[_type == "user" && userId == $id][0]`, {
          id: session.user.id,
        });

        if (existingUser) {
          userRef = { _type: 'reference', _ref: existingUser._id };
        } else {
          const userDoc = {
            _type: 'user',
            userId: session.user.id,
            name: session.user.name,
            username: session.user.username,
            image: session.user.image,
          };

          const createdUser = await writeClient.create(userDoc);
          userRef = { _type: 'reference', _ref: createdUser._id };
        }
      }

      const cardDoc = {
        _type: 'card',
        url: repoUrlInput.value,
        description: thoughtsInput.value,
        rating: rating,
        user: userRef,
        isAnonymous: isAnonymous,
        postedAt: new Date().toISOString(),
      };

      await writeClient.create(cardDoc);
      setRating(0);
      onClose();
      setShowRefreshNotification(true);
    } catch (error) {
      console.error('Error submitting repository:', error);
      alert('Failed to submit repository. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-popup">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome to RepoRater</h2>
            <p className="mt-2 text-gray-600 text-sm">Share and rate GitHub repositories</p>
          </div>

          <form className="space-y-6" onSubmit={validateForm}>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                name="isAnonymous"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                I want to post anonymously
              </label>
            </div>

            <div>
              <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
                Repository URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="repoUrl"
                name="repoUrl"
                required
                placeholder="https://github.com/username/repo"
                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 py-2 px-4 ${
                  errors.repoUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.repoUrl && <p className="mt-1 text-sm text-red-500">{errors.repoUrl}</p>}
            </div>

            <div>
              <label htmlFor="thoughts" className="block text-sm font-medium text-gray-700">
                Share your thoughts <span className="text-red-500">*</span>
              </label>
              <textarea
                id="thoughts"
                name="thoughts"
                required
                maxLength={150}
                rows={4}
                className={`mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 py-2 px-4 resize-none ${
                  errors.thoughts ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="What do you think about this repository? (max 150 characters)"
              />
              {errors.thoughts && <p className="mt-1 text-sm text-red-500">{errors.thoughts}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input type="hidden" name="rating" value={rating} required />
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 transition-colors duration-200 ${
                        star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                Post
              </button>
            </div>
          </form>

          {errors.rateLimit && (
            <p className="text-sm text-red-500 text-center">{errors.rateLimit}</p>
          )}
        </div>
      </div>
      {showRefreshNotification && <RefreshNotification countdown={countdown} />}
    </div>
  );
};

export default FormPopup;
