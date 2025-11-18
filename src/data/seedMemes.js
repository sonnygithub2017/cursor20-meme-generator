const seedBaseUser = 'seed-user';

export const seedMemes = [
  {
    id: 'seed-cartoon-puppy',
    imageUrl: '/assets/cartoon_puppy.jpg',
    createdAt: new Date('2024-07-04T12:00:00Z').getTime(),
    upvoteCount: 87,
    userId: seedBaseUser,
    isSeed: true,
  },
  {
    id: 'seed-dog-bird',
    imageUrl: '/assets/dog_bird.jpg',
    createdAt: new Date('2024-06-18T09:30:00Z').getTime(),
    upvoteCount: 42,
    userId: seedBaseUser,
    isSeed: true,
  },
  {
    id: 'seed-man-sofa',
    imageUrl: '/assets/man_sofa.png',
    createdAt: new Date('2024-05-22T15:45:00Z').getTime(),
    upvoteCount: 63,
    userId: seedBaseUser,
    isSeed: true,
  },
  {
    id: 'seed-puppy-sweater',
    imageUrl: '/assets/puppy-lying-sweater.jpg',
    createdAt: new Date('2024-08-11T18:20:00Z').getTime(),
    upvoteCount: 51,
    userId: seedBaseUser,
    isSeed: true,
  },
];

export default seedMemes;

