import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTicketAlt, FaCopy } from 'react-icons/fa';

const TEST_CODE = 'TEST-MTPS-2024';

export default function Seed() {
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const createTestCoupon = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'coupons', TEST_CODE), {
        code: TEST_CODE,
        status: 'unredeemed',
        createdAt: Date.now(),
        redeemedAt: null,
        redeemedBy: null,
        expiresAt: null,
        priceCharged: 0,
        soldOfflineVia: null,
      });
      setCreated(true);
      toast.success(`Test coupon ${TEST_CODE} created!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create coupon. Configure Firebase first.');
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(TEST_CODE);
    toast.success('Copied!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <FaTicketAlt className="text-accent text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Inter' }}>
            Test Coupon Generator
          </h1>
          <p className="text-text-muted text-sm mb-6">
            Create a test coupon to try the registration flow.
          </p>

          {!created ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createTestCoupon}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Generate Test Coupon</>
              )}
            </motion.button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm font-medium">Test coupon ready!</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light">
                <code className="text-lg font-mono tracking-wider text-accent">{TEST_CODE}</code>
                <button onClick={copyCode} className="p-2 rounded-lg hover:bg-accent/10 transition-colors text-accent">
                  <FaCopy />
                </button>
              </div>

              <ol className="text-left text-sm text-text-muted space-y-2">
                <li>1. Go to the <strong className="text-text">Join</strong> page</li>
                <li>2. Enter <code className="text-accent font-mono">{TEST_CODE}</code></li>
                <li>3. Sign in with Google</li>
                <li>4. Access your painter dashboard</li>
              </ol>
            </div>
          )}

          <p className="text-xs text-text-muted mt-6">
            This creates a real coupon in your Firestore database. Your Firebase project must be configured.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
