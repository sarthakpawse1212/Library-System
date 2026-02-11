import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  bookCount?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, bookCount }) => {
  return (
    <section className="gradient-hero px-4 py-12 text-primary-foreground">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          </div>
          <p className="text-lg opacity-90">{subtitle}</p>
          {bookCount !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-sm backdrop-blur-sm"
            >
              <Search className="h-4 w-4" />
              <span>{bookCount} books in our collection</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
