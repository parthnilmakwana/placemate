const cron = require('node-cron');
const { runDailyMatchingAgent } = require('./agent');

/**
 * Initializes all automated cron schedules for PlaceMate (Task 7.4)
 */
function initScheduler() {
  console.log('[SCHEDULER] Setting up automated background tasks...');

  // Schedule the AI Matching & Resume Tailoring agent for 8:00 AM daily
  const dailyJobCron = '0 8 * * *';

  if (cron.validate(dailyJobCron)) {
    cron.schedule(dailyJobCron, async () => {
      console.log('[SCHEDULER] Triggering daily matching agent at 8:00 AM...');
      try {
        await runDailyMatchingAgent();
      } catch (error) {
        console.error('[SCHEDULER ERROR] Daily matching agent execution failed:', error.message);
      }
    });
    console.log(`[SCHEDULER] Successfully scheduled daily agent with cron pattern: "${dailyJobCron}" (8:00 AM daily).`);
  } else {
    console.error('[SCHEDULER ERROR] Invalid cron pattern defined for daily agent.');
  }
}

module.exports = {
  initScheduler
};
