import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@placeprep.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@placeprep.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Computer Science',
    },
  });

  // Student users
  const studentPassword = await bcrypt.hash('student123', 12);
  await prisma.user.upsert({
    where: { email: 'student@placeprep.com' },
    update: {},
    create: {
      name: 'Ravi Kumar',
      email: 'student@placeprep.com',
      password: studentPassword,
      role: 'STUDENT',
      department: 'CSE',
      rollNumber: '21CS001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'priya@placeprep.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'priya@placeprep.com',
      password: studentPassword,
      role: 'STUDENT',
      department: 'IT',
      rollNumber: '21IT045',
    },
  });

  // Sample Knowledge Base
  const kb = await prisma.knowledgeBase.upsert({
    where: { id: 'sample-kb-1' },
    update: {},
    create: {
      id: 'sample-kb-1',
      title: 'Data Structures & Algorithms',
      description: 'Core DSA concepts for placement preparation',
      content: `
# Data Structures and Algorithms

## Arrays
An array is a collection of elements stored at contiguous memory locations. Arrays allow random access to elements using indices. Time complexity: Access O(1), Search O(n), Insert O(n), Delete O(n).

## Linked Lists
A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node. Types: Singly Linked List, Doubly Linked List, Circular Linked List. Advantages over arrays: Dynamic size, ease of insertion/deletion.

## Stacks
A stack follows LIFO (Last In First Out) principle. Operations: push(), pop(), peek(), isEmpty(). Used in: function calls, undo operations, expression evaluation, DFS traversal.

## Queues
A queue follows FIFO (First In First Out) principle. Types: Simple Queue, Circular Queue, Priority Queue, Deque. Used in: BFS traversal, scheduling, printer spooling.

## Trees
A tree is a hierarchical data structure. Binary Search Tree: left child < parent < right child. AVL Trees: self-balancing BST. Height balanced trees ensure O(log n) operations. Tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN).

## Graphs
A graph consists of vertices (V) and edges (E). Types: Directed, Undirected, Weighted, Unweighted. Representations: Adjacency Matrix, Adjacency List. Algorithms: BFS, DFS, Dijkstra's, Floyd-Warshall, Kruskal's, Prim's.

## Sorting Algorithms
- Bubble Sort: O(n²) time, O(1) space. Stable.
- Selection Sort: O(n²) time, O(1) space. Not stable.
- Insertion Sort: O(n²) worst, O(n) best. Stable.
- Merge Sort: O(n log n) always. O(n) space. Stable.
- Quick Sort: O(n log n) average, O(n²) worst. O(log n) space.
- Heap Sort: O(n log n) always. O(1) space. Not stable.

## Dynamic Programming
DP is an optimization technique that breaks problems into overlapping subproblems and stores results (memoization/tabulation). Classic problems: Fibonacci, Knapsack, Longest Common Subsequence, Matrix Chain Multiplication.

## Big O Notation
Used to describe algorithm efficiency. Common complexities: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2^n) exponential.
      `.trim(),
      topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Dynamic Programming'],
      adminId: admin.id,
    },
  });

  // Sample Quiz
  const quiz = await prisma.quiz.upsert({
    where: { id: 'sample-quiz-1' },
    update: {},
    create: {
      id: 'sample-quiz-1',
      title: 'DSA Fundamentals - Mock Test',
      description: 'Test your Data Structures and Algorithms knowledge for placement interviews',
      type: 'MIXED',
      status: 'ACTIVE',
      knowledgeBaseId: kb.id,
      adminId: admin.id,
      duration: 30,
      totalMarks: 20,
      passingMarks: 10,
      instructions: 'This is a mixed quiz with both MCQ and descriptive questions. Read each question carefully before answering.',
    },
  });

  // Sample Questions
  const questions = [
    {
      text: 'What is the time complexity of accessing an element in an array by index?',
      type: 'MCQ' as const,
      options: JSON.stringify([
        { id: 'A', text: 'O(n)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(1)' },
        { id: 'D', text: 'O(n²)' },
      ]),
      correctAnswer: 'C',
      explanation: 'Array elements are stored at contiguous memory locations, so any element can be accessed directly using its index in constant time O(1).',
      marks: 2,
      order: 0,
      topic: 'Arrays',
    },
    {
      text: 'Which data structure follows the LIFO (Last In First Out) principle?',
      type: 'MCQ' as const,
      options: JSON.stringify([
        { id: 'A', text: 'Queue' },
        { id: 'B', text: 'Stack' },
        { id: 'C', text: 'Linked List' },
        { id: 'D', text: 'Tree' },
      ]),
      correctAnswer: 'B',
      explanation: 'A Stack follows LIFO principle where the last element inserted is the first one to be removed. Think of a stack of plates.',
      marks: 2,
      order: 1,
      topic: 'Stacks',
    },
    {
      text: 'What is the best-case time complexity of Quick Sort?',
      type: 'MCQ' as const,
      options: JSON.stringify([
        { id: 'A', text: 'O(n²)' },
        { id: 'B', text: 'O(n)' },
        { id: 'C', text: 'O(n log n)' },
        { id: 'D', text: 'O(log n)' },
      ]),
      correctAnswer: 'C',
      explanation: 'Quick Sort best and average case is O(n log n) when the pivot divides the array into roughly equal halves. Worst case is O(n²) when pivot is always the smallest or largest element.',
      marks: 2,
      order: 2,
      topic: 'Sorting',
    },
    {
      text: 'Explain the difference between BFS and DFS graph traversal algorithms. When would you prefer one over the other?',
      type: 'DESCRIPTIVE' as const,
      options: undefined,
      correctAnswer: undefined,
      explanation: 'BFS uses a queue, explores level by level, better for shortest paths. DFS uses a stack (or recursion), explores depth first, better for topological sort, cycle detection.',
      marks: 5,
      order: 3,
      topic: 'Graphs',
    },
    {
      text: 'What is Dynamic Programming? Explain with an example.',
      type: 'DESCRIPTIVE' as const,
      options: undefined,
      correctAnswer: undefined,
      explanation: 'DP breaks problems into overlapping subproblems and stores results to avoid recomputation. Example: Fibonacci sequence - instead of recalculating fib(n-1) and fib(n-2) repeatedly, we store results.',
      marks: 5,
      order: 4,
      topic: 'Dynamic Programming',
    },
    {
      text: 'In a Binary Search Tree, what is the time complexity of search in the best case?',
      type: 'MCQ' as const,
      options: JSON.stringify([
        { id: 'A', text: 'O(n)' },
        { id: 'B', text: 'O(n log n)' },
        { id: 'C', text: 'O(1)' },
        { id: 'D', text: 'O(log n)' },
      ]),
      correctAnswer: 'D',
      explanation: 'In a balanced BST, search eliminates half the remaining elements at each step, giving O(log n) time complexity. O(1) would only be if the root is the target.',
      marks: 2,
      order: 5,
      topic: 'Trees',
    },
    {
      text: 'Which sorting algorithm has the best space complexity?',
      type: 'MCQ' as const,
      options: JSON.stringify([
        { id: 'A', text: 'Merge Sort' },
        { id: 'B', text: 'Quick Sort' },
        { id: 'C', text: 'Heap Sort' },
        { id: 'D', text: 'Insertion Sort' },
      ]),
      correctAnswer: 'C',
      explanation: 'Heap Sort has O(1) auxiliary space complexity (in-place sorting), making it the most memory-efficient among the O(n log n) sorting algorithms.',
      marks: 2,
      order: 6,
      topic: 'Sorting',
    },
  ];

  // Delete existing questions for the quiz and recreate
  await prisma.question.deleteMany({ where: { quizId: quiz.id } });
  for (const q of questions) {
    await prisma.question.create({
      data: { ...q, quizId: quiz.id, options: q.options ?? undefined },
    });
  }

  console.log('Seed completed!');
  console.log('Admin: admin@placeprep.com / admin123');
  console.log('Student: student@placeprep.com / student123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
