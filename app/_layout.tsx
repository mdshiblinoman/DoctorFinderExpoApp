import { Redirect, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Redirect href="/screen/first" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}