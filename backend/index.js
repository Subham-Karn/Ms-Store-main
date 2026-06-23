import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

// Import Routes
import productsRoutes from './routes/productsRoutes.js';
import authRoutes from './routes/AuthRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import addressRoutes from './routes/AddressRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';

// Import Utilities & Middleware
import { errorHandler } from './middleware/ErrorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 4000;

// --- Global Security & HTTP Request Logging Middleware ---

// Secure express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows frontend app to fetch Cloudinary resources cleanly
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"], // White-lists Cloudinary asset rendering
    },
  },
}));

// Setup Request Logger
app.use(morgan('dev'));

// --- Cross-Origin Resource Sharing (CORS) Configuration ---

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:2000",
  "http://localhost:2001",
  "http://127.0.0.1:2000",
  "http://127.0.0.1:2001",
  "https://msstore.in",
  "https://api.msstore.in"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(express.json());


app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/comments', commentsRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/orders', ordersRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to Ms Store API - Backend Services Active');
});

// Centralized error handling sequence interceptor
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});