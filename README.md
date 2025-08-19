# Beat Store Application

This application is a modern and user-friendly beat/music store built using the **MERN Stack** technologies. It allows users to browse, play, and purchase beats seamlessly.

🌐 **Live Demo**: [Beat Store on Render](https://vinkid-beatz.onrender.com/)  

📧 **Contact Me**: alvinzondi09@gmail.com  

---

## Features

- **Play Beats**: Users can preview beats directly on the website.
- **User Authentication**: Login and register functionalities for a personalized experience.
- **Purchase Beats**: Secure checkout process using **Stripe**.
- **Responsive Design**: Fully optimized for various devices.
- **Tailwind CSS Styling**: Clean, modern UI built with Tailwind for layout and components.
- **Bootstrap Buttons**: Buttons styled with Bootstrap for consistency and simplicity.

---

## How to Use the Application

1. **Browse Beats**: Anyone can access the beat store and play beats without an account.
2. **Create an Account**: To purchase beats, users must register for an account if they don’t already have one.
3. **Login**: Existing users can log in to access additional features, such as purchasing beats.
4. **Purchase Beats**: Add desired beats to the cart and proceed to checkout via Stripe for secure payment.

---

## Navigation

The application consists of **9 main pages**, accessible through a user-friendly navigation bar:

- **Home**: Overview of the beat store.
- **Beats**: Browse and play available beats.
- **Register**: Create a new account.
- **Login**: Access your account.
- **Cart**: View selected beats for purchase.
- **Checkout**: Secure payment via Stripe.
- **Profile**: Manage account details.
- **Contact**: Reach out for support or inquiries.
- **About**: Learn more about the application.

---

## Technologies Used

- **MongoDB**: Database for storing user data and beat information.
- **Express.js**: Backend framework for handling server-side logic.
- **React.js**: Frontend library for creating an interactive user interface.
- **Node.js**: Runtime environment for executing server-side JavaScript.
- **Stripe**: Secure payment gateway for processing transactions.
- **Tailwind CSS**: Utility-first CSS framework for modern styling.
- **Bootstrap**: Used specifically for button components.

---

## Challenges I Faced & How I Overcame Them
### Building this Beat Store came with a few challenges:
 - **Stripe Integration**: Learning how to manage API keys and webhooks was tricky. I solved it by carefully following the Stripe docs and testing in "test mode."
 - **File Uploads**: Handling beat uploads was challenging, but I used multer and express.static to manage and serve files properly.
 - **Styling Conflicts**: Tailwind and Bootstrap sometimes overlapped. I fixed this by restricting Bootstrap usage only to buttons and leaving layouts to Tailwind.
 - **Deployment on Render**: Environment variables caused issues initially. I solved this by properly setting up MONGO_URI, JWT_SECRET, and STRIPE_SECRET_KEY in Render’s dashboard.
 - **Authentication Flow**: JWT tokens weren’t stored/validated correctly at first. I fixed it by using localStorage in React and middleware on the backend for validation.
 - **Audio Controls Across Pages**: One major issue was keeping the audio player state when navigating between pages. Initially, playback stopped when switching routes. I solved this by implementing Redux for global state management, which allowed the audio controls to persist across pages.
 -- These challenges taught me how to debug effectively, read documentation carefully, and design features that work smoothly across the full stack.
