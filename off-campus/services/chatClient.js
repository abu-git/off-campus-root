// File: services/chatClient.js
import { StreamChat } from 'stream-chat';

// 1. Add your Stream API Key (this is the public key, safe to put here)
const apiKey = 'gmvmehyzvek3';

// 2. Initialize the chat client
// We create a singleton instance to use across the app
export const chatClient = StreamChat.getInstance(apiKey);

// 3. This is the URL to the Vercel function you just deployed
const vercelTokenApiUrl = 'https://off-campus-api.vercel.app/api/create-token';

/**
 * Connects the logged-in user to Stream Chat.
 * Fetches a token from our secure Vercel endpoint.
 * @param {string} userId - The user's unique ID (e.g., Clerk User ID)
 * @param {string} userName - The user's full name
 * @param {string} userImage - The user's profile image URL
 */
export const connectStreamUser = async (userId, userName, userImage) => {
  if (!userId || !userName) {
    console.error('Stream user connection failed: userId or userName is missing.');
    return;
  }

  // Check if the user is already connected
  if (chatClient.userID === userId) {
    console.log('Stream user already connected:', userId);
    return;
  }

  try {
    console.log('Fetching Stream token for user:', userId);
    // 4. Call your Vercel API to get a token
    const response = await fetch(vercelTokenApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get token: ${errorText}`);
    }

    const { token } = await response.json();
    console.log('Stream token fetched successfully.');

    // 5. Connect the user to Stream with the token and set user details
    await chatClient.connectUser(
      {
        id: userId,
        name: userName,
        image: userImage,
      },
      token // The token from your Vercel endpoint
    );

    console.log('Stream user connected successfully:', userId);
    
  } catch (error) {
    console.error('Error connecting Stream user:', error);
    // Disconnect if a partial connection was made
    if (chatClient.userID) {
      await chatClient.disconnectUser();
    }
  }
};