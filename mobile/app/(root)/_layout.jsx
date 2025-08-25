import { useUser } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { Stack } from 'expo-router/stack'

export default function Layout() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) return null; // this is for better experience

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />
  }

  return <Stack screenOptions={{ headerShown: false }}/>
}