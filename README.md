# GreenView Web

A modern web application for project management built with Next.js, React, TypeScript, and Firebase. 

## 🚀 Features

- **User Authentication**:  Secure sign-in and sign-up with Firebase Authentication
- **Project Management**: Create and manage your projects
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Type-Safe**: Full TypeScript support for enhanced developer experience
- **Responsive Design**: Mobile-friendly interface with beautiful animations

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Firebase](https://firebase.google.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with animations
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**:  Lucide React & Tabler Icons
- **Testing**: Jest with React Testing Library

## 📋 Prerequisites

Before you begin, ensure you have the following installed: 
- Node.js (v20 or higher)
- npm, yarn, pnpm, or bun

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/ehebron2024/greenview-web.git
cd greenview-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Copy your Firebase configuration
   - Update the `firebase.ts` file with your credentials

## 🚀 Getting Started

Run the development server: 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📝 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run Jest tests

## 📁 Project Structure

```
greenview-web/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── authentication/  # Auth forms
│   └── ui/           # UI components
├── context/          # React context providers
├── lib/              # Utility functions
├── public/           # Static assets
├── firebase.ts       # Firebase configuration
└── package.json      # Dependencies and scripts
```

## 🧪 Testing

Run the test suite: 

```bash
npm test
```

This project uses Jest and React Testing Library for unit and integration testing.

## 🎨 Styling

The application uses: 
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming
- **Radix UI** for accessible component primitives
- **Motion** for smooth animations

## 🔒 Authentication

GreenView uses Firebase Authentication to provide secure user authentication.  Users can:
- Sign up with email and password
- Sign in to existing accounts
- Access personalized project dashboards

## 🚢 Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ehebron2024/greenview-web)

### Other Platforms

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more deployment options.

## 📖 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [React Documentation](https://react.dev) - Learn React
- [Firebase Documentation](https://firebase.google.com/docs) - Learn about Firebase
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn Tailwind CSS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary. 

## 👤 Author

**ehebron2024**
- GitHub: [@ehebron2024](https://github.com/ehebron2024)

## 🙏 Acknowledgments

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
