# React & Astro UI Component Library

This is the Kovalee local UI component library that provides both React and Astro components styled with Tailwind CSS. The library is designed for use in projects that have Tailwind CSS already set up.

## Getting Started

To use the components from this library in your project, you need to set up Tailwind CSS.

### Prerequisites

- Your project must have Tailwind CSS configured.
- Node.js and npm/yarn installed.

### Installation

Since this library is intended for local use, you can add it to your project by adding `@kovalee/core` to the `package.json`.

1. Add `"@kovalee/core": "^1.0.0"` to `package.json` (library has no version yet).
2. Add the following `import "@kovalee/core/ui/style.css";` in your root component to include the library's styles.
3. Run `npm install` to install the library.

```json
{
  "dependencies": {
    "@kovalee/core": "^1.0.0"
  }
}
```

### Tailwind Setup

Ensure that your project has Tailwind CSS properly configured. You can follow [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation) for guidance on setting up Tailwind.

### Usage

To use components from the library, import them directly into your project. Below are some examples:

#### Astro Component Example

To use the `Error404` component in an Astro project:

```astro
---
import Error404 from "@kovalee/core/ui/astro/Error404.astro";
---

<Error404 />
```

#### React Component Example

To use the `Button` component in a React project:

```tsx
import Button from "@kovalee/core/ui/react/Button";
import React from "react";

const App = () => (
  <Button label="Click Me" onClick={() => alert("Button Clicked!")} />
);

export default App;
```

## Folder Structure

The folder structure of the library is as follows:

```
core/
|-- src/
    |-- ui/
        |-- input.css
        |-- react/
        |   |-- Button.tsx
        |   |-- Card.tsx
        |-- astro/
            |-- Hero.astro
            |-- Footer.astro
|-- dist/
|-- package.json
|-- tsconfig.json
|-- tailwind.config.js

```

- **React Components**: Located in `src/ui/react/`.
- **Astro Components**: Located in `src/ui/astro/`.

## Development

To make changes to the library or add new components, follow these steps:

1. **Add the Component**
   Add the new component to the appropriate folder in the `src/ui/` directory.

2. **Install Dependencies**
   This can be done in the root of your project from `tech-monorepo/typescript/`.

   ```bash
   npm install
   ```

3. **Import the Library**
   Import your local version to any project where you wish to use the library.

## Contributing

Feel free to contribute by adding new components or improving existing ones. Please follow the existing structure and style guidelines.

## Notes

- Ensure Tailwind is properly set up in your project, as the components depend on Tailwind CSS.
- Import the library's `style.css` file at the base of your application to apply the necessary styles.
