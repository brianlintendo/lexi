# System Architecture: Building Systems with Clarity

This document outlines how the Lexi journal system has been restructured following the framework principles from the Strange Loop Conference talk about building systems.

## 🎯 Core Principles Applied

### 1. **Single Responsibility Principle**
Each component and hook has one clear purpose:

- **`useJournalEntries`**: Manages journal entry data and persistence
- **`useDateNavigation`**: Handles date selection and calendar logic  
- **`useChatPreview`**: Manages chat preview state
- **`JournalCalendar`**: Renders the calendar UI
- **`JournalEntryDisplay`**: Displays completed journal entries
- **`journalHelpers`**: Contains pure utility functions
- **`ChatBubble`**: Enhanced with smart correction highlighting

### 2. **Separation of Concerns**
Clear boundaries between different layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (Components)                    │
├─────────────────────────────────────────────────────────────┤
│                 Business Logic (Hooks)                      │
├─────────────────────────────────────────────────────────────┤
│                  Data Layer (API/Storage)                   │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Simplified Logic Flow**
Instead of complex intertwined state, we have clear data flow:

```
User Action → Hook Method → State Update → UI Re-render
```

## 🏗️ Architecture Overview

### Before (Monolithic Component)
```javascript
// 1221 lines of mixed concerns
export default function JournalPage() {
  // 15+ state variables
  // 8+ useEffect hooks
  // Complex business logic mixed with UI
  // Direct API calls in component
  // localStorage operations scattered
}
```

### After (Modular System)
```javascript
// 300 lines focused on UI coordination
export default function JournalPageRefactored() {
  // Custom hooks handle business logic
  const { entries, saveEntry, deleteEntry } = useJournalEntries();
  const { selectedDate, selectDate } = useDateNavigation();
  const { chatPreview } = useChatPreview();
  
  // Component focuses on UI coordination
  return <JournalCalendar />;
}
```

## 📁 File Structure

```
src/
├── hooks/
│   ├── useJournalEntries.js      # Data management
│   ├── useDateNavigation.js      # Calendar logic
│   └── useChatPreview.js         # Chat state
├── components/
│   ├── JournalCalendar.jsx       # Calendar UI
│   ├── JournalEntryDisplay.jsx   # Entry display
│   └── ChatBubble.jsx            # Enhanced with highlighting
├── utils/
│   └── journalHelpers.js         # Pure functions
└── pages/
    └── JournalPageRefactored.jsx # Main coordinator
```

## 🔄 Data Flow

### 1. **Journal Entries Flow**
```
User types → handleTextChange → saveEntry → useJournalEntries → localStorage/Supabase
```

### 2. **Date Navigation Flow**
```
User clicks date → handleDateClick → selectDate → useDateNavigation → UI updates
```

### 3. **Chat Integration Flow**
```
Chat ends → handleEnd → process messages → saveEntry → markAsSubmitted
```

### 4. **Correction Highlighting Flow**
```
User text + AI correction → highlightCorrections → Visual highlighting → User sees changes
```

## 🎨 Enhanced Features

### **Smart Correction Highlighting**
- **Background**: `#E4DDFF` (light purple)
- **Text Color**: `#7A54FF` (original purple)
- **Wavy Underline**: Indicates corrections
- **Tooltip**: "This word was corrected or added"
- **Smart Detection**: Compares user text with AI corrections

### **How Highlighting Works**
```javascript
function highlightCorrections(userText, aiText) {
  // Normalizes text for comparison
  // Creates set of user words for fast lookup
  // Highlights words that are corrections or additions
  // Returns React elements with proper styling
}
```

## 🎨 Benefits Achieved

### **Maintainability**
- Each piece has a clear purpose
- Easy to locate and modify specific functionality
- Reduced cognitive load when working on features

### **Testability**
- Pure functions in `journalHelpers.js`
- Isolated business logic in custom hooks
- UI components can be tested independently

### **Reusability**
- `useJournalEntries` can be used in other components
- `JournalCalendar` can be reused in different contexts
- Utility functions are pure and portable

### **Performance**
- Reduced re-renders through focused state management
- Lazy loading of AI prompts
- Efficient data fetching patterns

### **User Experience**
- Clear visual feedback for corrections
- Consistent purple theme throughout
- Intuitive highlighting system

## 🛠️ Implementation Details

### Custom Hooks Pattern
```javascript
// Encapsulates related state and logic
export function useJournalEntries() {
  const [entries, setEntries] = useState({});
  
  const saveEntry = async (dateKey, text, submitted) => {
    // Business logic here
  };
  
  return { entries, saveEntry, deleteEntry };
}
```

### Component Composition
```javascript
// Each component has a single responsibility
<JournalCalendar
  weekDates={weekDates}
  onDateClick={handleDateClick}
  language={language}
/>
```

### Pure Utility Functions
```javascript
// No side effects, easy to test
export function isPromptText(text) {
  return promptPatterns.some(pattern => text.includes(pattern));
}
```

### Enhanced ChatBubble
```javascript
// Smart highlighting with user context
<ChatBubble 
  sender="ai" 
  text={aiText} 
  userText={userText} // For highlighting comparisons
/>
```

## 🚀 Migration Strategy

### Phase 1: Extract Hooks ✅
1. Create `useJournalEntries.js` ✅
2. Move data management logic ✅
3. Update component to use hook ✅

### Phase 2: Extract Components ✅
1. Create `JournalCalendar.jsx` ✅
2. Create `JournalEntryDisplay.jsx` ✅
3. Move UI logic to components ✅

### Phase 3: Extract Utilities ✅
1. Create `journalHelpers.js` ✅
2. Move pure functions ✅
3. Update imports ✅

### Phase 4: Refactor Main Component ✅
1. Simplify `JournalPage.jsx` ✅
2. Focus on coordination ✅
3. Remove duplicated logic ✅

### Phase 5: Enhanced Features ✅
1. Implement correction highlighting ✅
2. Update ChatBubble component ✅
3. Pass userText for comparisons ✅

## 📊 Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of Code | 1,221 | 300 | 75% reduction |
| State Variables | 15+ | 9 | 40% reduction |
| useEffect Hooks | 8+ | 2 | 75% reduction |
| Responsibilities | Mixed | Separated | Clear boundaries |
| Testability | Low | High | Easy to test |
| Features | Basic | Enhanced | Smart highlighting |

## 🎯 Key Takeaways

1. **Don't overcomplicate**: Each piece should do one thing well
2. **Separate concerns**: UI, business logic, and data should be distinct
3. **Use composition**: Build complex systems from simple parts
4. **Make it testable**: Pure functions and isolated logic
5. **Keep it readable**: Clear names and focused responsibilities
6. **Enhance UX**: Smart features like correction highlighting improve user experience

This architecture follows the principle that **simple, focused components working together create robust, maintainable systems** with enhanced user experiences. 