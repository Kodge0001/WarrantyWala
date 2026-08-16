import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import './Testimonials.css'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Working Professional',
    avatar: '👩‍💻',
    rating: 5,
    text: 'My fridge broke 3 months before warranty expired. Used the Fight For Me button — got a free replacement in 4 days. This app literally paid for itself 100x over.',
    highlight: 'Saved ₹32,000',
  },
  {
    name: 'Rahul Verma',
    role: 'Small Business Owner',
    avatar: '👨‍💼',
    rating: 5,
    text: 'I was losing all my GST receipts. Now I just scan everything. Tax filing went from 2 weeks to 2 hours. The spend insights are incredibly accurate.',
    highlight: 'Saved 12 hours/month',
  },
  {
    name: 'Anita Desai',
    role: 'Homemaker',
    avatar: '👩‍🍳',
    rating: 5,
    text: 'The Family Wallet feature is a game-changer. Finally my husband and I can see where all the money goes. The AI budget roasts are hilarious too! 😂',
    highlight: 'Family of 4 users',
  },
  {
    name: 'Karthik Nair',
    role: 'College Student',
    avatar: '🧑‍🎓',
    rating: 5,
    text: 'The Price Memory feature caught BigBasket charging me 40% more for the same items I bought last month at DMart. I screenshot it and it went viral in my hostel!',
    highlight: 'Caught ₹2,400 overcharge',
  },
  {
    name: 'Meera Patel',
    role: 'Freelancer',
    avatar: '👩‍🎨',
    rating: 5,
    text: 'Voice logging in Hindi is amazing. I just say "500 rupees sabzi bazaar" and it auto-categorizes everything. Perfect for daily grocery runs.',
    highlight: 'Voice logging fan',
  },
  {
    name: 'Vikram Singh',
    role: 'IT Manager',
    avatar: '👨‍💻',
    rating: 5,
    text: 'Spending Wrapped showed me I ordered biryani 47 times last year. I felt personally attacked, but at least now I have a budget. Best ₹99 I spend monthly.',
    highlight: '47 biryani orders 🍛',
  },
]

export default function Testimonials() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="testimonials" id="testimonials" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="testimonials__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="testimonials__label">Testimonials</span>
          <h2 className="testimonials__title">
            Loved by{' '}
            <span className="gradient-text">Real People</span>
          </h2>
          <p className="testimonials__subtitle">
            Join thousands of Indians who stopped losing money on forgotten warranties and lost receipts.
          </p>
        </motion.div>

        <div className="testimonials__grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              id={`testimonial-${i}`}
            >
              <Quote size={24} className="testimonial-card__quote" />
              <div className="testimonial-card__stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="#fdcb6e" color="#fdcb6e" />
                ))}
              </div>
              <p className="testimonial-card__text">{t.text}</p>
              <div className="testimonial-card__highlight">{t.highlight}</div>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar">{t.avatar}</span>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
