# Lexi Mobile (Expo + TypeScript)

## 🚀 Migration Status

- ✅ **Logic migrated:** All core logic (API, hooks, context, Supabase, OpenAI) ported to TypeScript in `src/`
- ✅ **Screens scaffolded:** All main screens created in `src/screens/` with labeled functional components
- ✅ **Navigation:** React Navigation set up in `App.tsx` with all screens registered
- ✅ **TypeScript:** All new code uses TypeScript best practices

## 📁 Project Structure

- `src/api/` — API logic (journal, profile, saved phrases, OpenAI)
- `src/hooks/` — Auth and other hooks
- `src/context/` — Context providers (journal, profile)
- `src/screens/` — All app screens (Journal, Chat, Home, etc.)

## 🛠️ Next Steps

1. **Rebuild UI:**
   - Replace placeholder screens with real UI using React Native components (`View`, `Text`, `ScrollView`, etc.)
   - Use `StyleSheet.create` for styles (no CSS files)
2. **Port Assets:**
   - Use `expo-asset` for images, `react-native-svg` for SVGs
   - Replace web icons with [@expo/vector-icons](https://docs.expo.dev/guides/icons/)
3. **Implement Features:**
   - Connect screens to migrated logic (API, context, hooks)
   - Add authentication, journal entry, chat, and settings flows
4. **Test on Device:**
   - Use Expo Go app to test on iOS/Android
5. **App Store Prep:**
   - Set up app.json (name, icon, splash)
   - Use EAS Build for App Store/TestFlight

## 🏷️ Best Practices
- Use TypeScript for all new files
- Keep business logic in `src/api`, UI in `src/screens`
- Use context/hooks for state management
- Use navigation for all screen transitions
- Test on both iOS and Android

---

**Happy building!** 