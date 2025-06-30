# Knowledge Base for Categorizer

This project is a web application built with [Next.js](https://nextjs.org/) that allows uploading, viewing, and processing files for categorization. The application currently includes features such as:

- **Upload files**: Select and upload multiple files.
- **List pending files**: Display uploaded files that have not yet been processed.
- **Process files**: Extract metadata and categorize files using LLM, OCR, or manual methods.
- **Visualization**: A friendly interface with custom components styled using Tailwind CSS and state managed with Zustand.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Development](#development)
  - [Production](#production)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contribution](#contribution)
- [License](#license)
- [Upcoming Updates](#upcoming-updates)

---

## Requirements

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- Connection to the external categorization API (environment variables must be configured)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://your-repo-url.git
   cd project-name
   ```

2. **Install dependencies:**

   With npm:
   ```bash
   npm install
   ```

   Or with Yarn:
   ```bash
   yarn install
   ```

---

## Configuration

The project uses environment variables to connect to the categorizer API and configure other parameters. Create a `.env.local` file in the project root and define at least the following variables:

```env
# Base URL for calls to the categorizer API
NEXT_PUBLIC_CATEGORIZER_URL=https://your-categorizer-api.com

# Base URL for calls to the processing API (LLM, OCR, etc.)
NEXT_PUBLIC_API_URL=https://your-processing-api.com
```

Make sure to replace the URLs with those corresponding to your environment.

---

## Usage

### Development

To start the development server and test the application locally, run:

```bash
npm run dev
```

Or if you use Yarn:

```bash
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Production

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start the server in production mode:**

   ```bash
   npm run start
   ```

---

## Project Structure

The project is organized with the following main directories and files:

- **`app/`**: Contains pages and main components.
  - **`layout.tsx`**: Defines the global layout and imports stylesheets.
  - **`page.tsx`**: Main page showing categorization options.
  - **`upload-files/`**: Page for uploading multiple files.
  - **`pending/`**: Page listing files pending processing.
  - **`processing/`**: Page for processing files (extracting metadata with LLM and OCR).
- **`components/`**: Reusable components (buttons, lists, forms, etc.).
- **`store/filestore.ts`**: Manages file state using Zustand and persists information.
- **`lib/`**: General utilities (for example, functions to merge CSS classes).
- **`utils/categorizerAPI.ts`**: Functions to interact with the categorizer API, including methods to upload files, get files, process with LLM and OCR, and save metadata.
- **Configuration files**:
  - `next.config.ts`: Next.js configuration.
  - `next-env.d.ts`: Type definitions for Next.js.

---

## Technologies Used

- **Next.js**: React framework that simplifies development with SSR and automatic routes.
- **React**: Library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for quick styling.
- **Zustand**: Library for global state management.
- **Axios and Fetch API**: For making HTTP requests to the API.
- **TypeScript**: JavaScript superset that adds static typing.

---

## Contribution

If you want to contribute to the project, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix: `git checkout -b my-feature`.
3. Make your changes and commit them with descriptive messages.
4. Submit a pull request detailing your changes.

---

## License

This project is distributed under the [MIT License](LICENSE).

---

## Upcoming Updates

The following features are planned for future releases:

- Voice, music, and video support in the RAG graph system.
- Tools to experiment with graph algorithms and visualize data.

---

This README provides the basic instructions for installing, configuring, and using the application. Review each section and adapt it to your environment and specific requirements.
