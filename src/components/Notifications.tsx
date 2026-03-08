'use client';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const { notifications, dismissNotification } = useStore();
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            className={`glass-strong px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-3 cursor-pointer shadow-xl max-w-xs ${
              n.type === 'success' ? 'text-green-300 border-green-500/30' :
              n.type === 'warning' ? 'text-yellow-300 border-yellow-500/30' :
              'text-blue-300 border-blue-500/30'
            }`}
            onClick={() => dismissNotification(n.id)}
          >
            <span>{n.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
