import { useAuth, useUser } from '@clerk/clerk-expo'; // Import useUser
import { Redirect, Stack, useSegments } from 'expo-router'; // Import useSegments

export default function AuthRoutesLayout() {
    const { isSignedIn } = useAuth();
    const { user } = useUser(); // Get user to check role
    const segments = useSegments(); // Get current route segments

    // Check if the current route is the select-role screen
    // Note: segments in auth group will be like ['(auth)', 'select-role']
    const isSelectRoleScreen = segments[1] === 'select-role';

    // Allow access IF:
    // 1. User is NOT signed in OR
    // 2. User IS signed in, has NO role, AND is trying to access the select-role screen
    if (isSignedIn && !user?.publicMetadata?.role && isSelectRoleScreen) {
        // Allow rendering select-role screen for users who need to choose a role
        return <Stack screenOptions={{ headerShown: false }} />;
    }

    // If signed in AND (has a role OR is not on select-role screen), redirect away from auth
    if (isSignedIn) {
        return <Redirect href={'/'} />;
    }

    // If not signed in, allow rendering auth screens (sign-in, select-role initially)
    return <Stack screenOptions={{ headerShown: false }} />;
}