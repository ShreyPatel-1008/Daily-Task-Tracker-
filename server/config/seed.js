const User = require('../models/User');
const Task = require('../models/Task');

const DEFAULT_USER = {
    name: 'Admin User',
    email: 'admin@taskflow.com',
    password: 'admin123'
};

const SAMPLE_TASKS = [
    { title: 'Complete project documentation', description: 'Write comprehensive docs for the TaskFlow project', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Work', dueDate: new Date(Date.now() + 2 * 86400000) },
    { title: 'Design landing page', description: 'Create a modern landing page with hero section', status: 'COMPLETED', priority: 'HIGH', category: 'Design', dueDate: new Date(Date.now() - 86400000), completedAt: new Date(Date.now() - 86400000) },
    { title: 'Workout session', description: '30 min cardio + strength training', status: 'NOT_STARTED', priority: 'MEDIUM', category: 'Fitness', dueDate: new Date() },
    { title: 'Read Clean Code book', description: 'Chapter 5 - Formatting', status: 'IN_PROGRESS', priority: 'LOW', category: 'Study', dueDate: new Date(Date.now() + 3 * 86400000) },
    { title: 'Fix login bug', description: 'Resolve the token refresh issue on mobile', status: 'COMPLETED', priority: 'HIGH', category: 'Coding', dueDate: new Date(Date.now() - 2 * 86400000), completedAt: new Date(Date.now() - 2 * 86400000) },
    { title: 'Weekly team standup', description: 'Discuss sprint progress and blockers', status: 'COMPLETED', priority: 'MEDIUM', category: 'Meeting', dueDate: new Date(Date.now() - 3 * 86400000), completedAt: new Date(Date.now() - 3 * 86400000) },
    { title: 'Grocery shopping', description: 'Buy vegetables, fruits, and milk', status: 'NOT_STARTED', priority: 'LOW', category: 'Personal', dueDate: new Date(Date.now() + 1 * 86400000) },
    { title: 'Deploy API to production', description: 'Set up CI/CD pipeline and deploy', status: 'NOT_STARTED', priority: 'HIGH', category: 'Work', dueDate: new Date(Date.now() + 4 * 86400000) },
    { title: 'Learn React Server Components', description: 'Watch Next.js tutorial on RSC', status: 'IN_PROGRESS', priority: 'MEDIUM', category: 'Study', dueDate: new Date(Date.now() + 5 * 86400000) },
    { title: 'Prepare presentation slides', description: 'Q1 product review presentation', status: 'COMPLETED', priority: 'HIGH', category: 'Work', dueDate: new Date(Date.now() - 4 * 86400000), completedAt: new Date(Date.now() - 4 * 86400000) },
    { title: 'Morning meditation', description: '15 minutes mindfulness session', status: 'COMPLETED', priority: 'LOW', category: 'Personal', dueDate: new Date(), completedAt: new Date() },
    { title: 'Code review for PR #42', description: 'Review frontend refactoring changes', status: 'COMPLETED', priority: 'MEDIUM', category: 'Coding', dueDate: new Date(Date.now() - 5 * 86400000), completedAt: new Date(Date.now() - 5 * 86400000) },
    { title: 'Update portfolio website', description: 'Add recent projects and skills', status: 'NOT_STARTED', priority: 'LOW', category: 'Coding', dueDate: new Date(Date.now() + 7 * 86400000) },
    { title: 'Run 5K', description: 'Training for upcoming marathon', status: 'COMPLETED', priority: 'MEDIUM', category: 'Fitness', dueDate: new Date(Date.now() - 6 * 86400000), completedAt: new Date(Date.now() - 6 * 86400000) },
    { title: 'Database optimization', description: 'Add indexes and optimize slow queries', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Coding', dueDate: new Date(Date.now() + 2 * 86400000) },
];

const seedDatabase = async () => {
    try {
        // Check if default user already exists
        const existingUser = await User.findOne({ email: DEFAULT_USER.email });

        if (existingUser) {
            console.log('✅ Default user already exists');
            console.log(`   📧 Email: ${DEFAULT_USER.email}`);
            console.log(`   🔑 Password: ${DEFAULT_USER.password}`);
            return;
        }

        // Create default user
        const user = await User.create(DEFAULT_USER);
        console.log('✅ Default user created successfully');
        console.log(`   📧 Email: ${DEFAULT_USER.email}`);
        console.log(`   🔑 Password: ${DEFAULT_USER.password}`);

        // Create sample tasks for the user
        const tasksWithUser = SAMPLE_TASKS.map(task => ({
            ...task,
            userId: user._id
        }));

        await Task.insertMany(tasksWithUser);
        console.log(`✅ ${SAMPLE_TASKS.length} sample tasks created`);

    } catch (error) {
        console.error('❌ Seed error:', error.message);
    }
};

module.exports = seedDatabase;
