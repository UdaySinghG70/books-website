// Run: node database/seed.js
// Seeds users with properly hashed passwords, categories, and books with cover images.

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'booksdb',
    multipleStatements: true,
  });

  console.log('Connected. Seeding...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash  = await bcrypt.hash('user123', 10);

  await db.execute(
    `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
    ['Admin', 'admin@bookstore.com', adminHash, 'ADMIN']
  );
  await db.execute(
    `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
    ['John Doe', 'user@bookstore.com', userHash, 'USER']
  );
  console.log('✓ Users seeded');

  // ── Categories ─────────────────────────────────────────────────────────────
  const cats = [
    [1,  'Fiction',       1, null],
    [2,  'Non-Fiction',   1, null],
    [3,  'Romance',       2, 1],
    [4,  'Adventure',     2, 1],
    [5,  'Biography',     2, 2],
    [6,  'Technology',    2, 2],
    [7,  'Classic',       3, 3],
    [8,  'Quest',         3, 4],
    [9,  'Autobiography', 3, 5],
    [10, 'Programming',   3, 6],
  ];
  for (const [id, name, level, parentId] of cats) {
    await db.execute(
      `INSERT INTO categories (id, name, level, parent_id) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [id, name, level, parentId]
    );
  }
  console.log('✓ Categories seeded');

  // ── Books ──────────────────────────────────────────────────────────────────
  // Cover images use Open Library Covers API — free, no key needed.
  // Format: https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg
  // Fallback for books without a good ISBN: direct OL cover ID.
  //
  // Columns: [title, author, description, category_id, cover_image]
  const books = [
    [
      'The Great Gatsby',
      'F. Scott Fitzgerald',
      'A novel set in the Jazz Age on Long Island, near New York City. The story is narrated by Nick Carraway, who observes the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan.',
      7,
      'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    ],
    [
      'Pride and Prejudice',
      'Jane Austen',
      'A romantic novel following Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of early 19th-century England.',
      7,
      'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    ],
    [
      'The Alchemist',
      'Paulo Coelho',
      'A philosophical novel following a young Andalusian shepherd named Santiago on his journey to the pyramids of Egypt in search of treasure and his Personal Legend.',
      8,
      'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
    ],
    [
      'To Kill a Mockingbird',
      'Harper Lee',
      'A novel about racial injustice and the loss of innocence in the American South, seen through the eyes of young Scout Finch as her father defends a Black man accused of a crime.',
      7,
      'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg',
    ],
    [
      '1984',
      'George Orwell',
      'A dystopian social science fiction novel set in a totalitarian society under constant surveillance, following Winston Smith as he rebels against the oppressive Party.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    ],
    [
      'The Hobbit',
      'J.R.R. Tolkien',
      'Bilbo Baggins, a homebody hobbit, is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor from the dragon Smaug.',
      8,
      'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
    ],
    [
      'The Catcher in the Rye',
      'J.D. Salinger',
      'A novel narrating teenager Holden Caulfield\'s experiences in New York City after being expelled from prep school, exploring themes of identity and alienation.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg',
    ],
    [
      'Atomic Habits',
      'James Clear',
      'A practical guide on how tiny changes in behavior can lead to remarkable results by building good habits and breaking bad ones through a proven four-step framework.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    ],
    [
      'Sapiens',
      'Yuval Noah Harari',
      'A brief history of humankind from the Stone Age to the present, exploring how Homo sapiens came to dominate the Earth and the impact on the world around us.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    ],
    [
      'The Da Vinci Code',
      'Dan Brown',
      'A mystery thriller novel following symbologist Robert Langdon as he investigates a murder in the Louvre Museum and uncovers a religious mystery protected by a secret society.',
      4,
      'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg',
    ],
    [
      "Harry Potter and the Sorcerer's Stone",
      'J.K. Rowling',
      'A young boy discovers on his eleventh birthday that he is a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
    ],
    [
      'The Lord of the Rings',
      'J.R.R. Tolkien',
      'An epic high-fantasy novel about the quest to destroy the One Ring, a powerful artifact that could give the Dark Lord Sauron domination over Middle-earth.',
      8,
      'https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg',
    ],
    [
      'Brave New World',
      'Aldous Huxley',
      'A dystopian novel set in a futuristic World State where citizens are environmentally engineered and conditioned for their roles in a rigid class system.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg',
    ],
    [
      'The Hunger Games',
      'Suzanne Collins',
      'In a dystopian future nation of Panem, teenager Katniss Everdeen volunteers to take her sister\'s place in the brutal, televised Hunger Games survival competition.',
      4,
      'https://covers.openlibrary.org/b/isbn/9780439023481-L.jpg',
    ],
    [
      'Gone with the Wind',
      'Margaret Mitchell',
      "A sweeping historical novel set during the American Civil War and Reconstruction era, following the determined Scarlett O'Hara and her turbulent relationship with Rhett Butler.",
      3,
      'https://covers.openlibrary.org/b/isbn/9781451635621-L.jpg',
    ],
    [
      'Dune',
      'Frank Herbert',
      'An epic science fiction novel set in a distant future amidst a feudal interstellar society, following young Paul Atreides as he navigates politics, religion, and survival on the desert planet Arrakis.',
      4,
      'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg',
    ],
    [
      'The Shining',
      'Stephen King',
      'A horror novel about Jack Torrance, a writer who becomes the winter caretaker of the isolated Overlook Hotel, where a malevolent supernatural presence drives him to madness.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780307743657-L.jpg',
    ],
    [
      'Steve Jobs',
      'Walter Isaacson',
      'The exclusive biography of Apple co-founder Steve Jobs, based on more than forty interviews and revealing the genius and complexity behind one of the most influential innovators of our time.',
      9,
      'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
    ],
    [
      'Clean Code',
      'Robert C. Martin',
      'A handbook of agile software craftsmanship offering best practices and guidelines for writing clean, readable, and maintainable code that other developers will appreciate.',
      10,
      'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    ],
    [
      'The Pragmatic Programmer',
      'Andrew Hunt',
      'A guide for programmers to improve their craft, work more effectively with teams, and ultimately build better software through practical advice and real-world examples.',
      10,
      'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
    ],
    [
      'Educated',
      'Tara Westover',
      'A memoir by a woman who grows up in a strict survivalist family in rural Idaho, never attending school, and eventually earns a PhD from Cambridge University through sheer determination.',
      9,
      'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg',
    ],
    [
      'The Midnight Library',
      'Matt Haig',
      'A novel about a library that exists between life and death, where each book represents a different life you could have lived, and one woman\'s chance to undo her regrets.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg',
    ],
    [
      'Where the Crawdads Sing',
      'Delia Owens',
      'A coming-of-age story and murder mystery about a girl who raises herself in the marshes of North Carolina and becomes a suspect when the town\'s most eligible bachelor is found dead.',
      3,
      'https://covers.openlibrary.org/b/isbn/9780735224292-L.jpg',
    ],
    [
      'The Power of Habit',
      'Charles Duhigg',
      'An exploration of the science behind habit creation and reformation, drawing on research from neurology, psychology, and sociology to explain why habits exist and how they can be changed.',
      2,
      'https://covers.openlibrary.org/b/isbn/9781400069286-L.jpg',
    ],
    [
      'Thinking, Fast and Slow',
      'Daniel Kahneman',
      'An examination of the two systems that drive the way we think: System 1 (fast, intuitive) and System 2 (slow, deliberate), and how they shape our judgments and decisions.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
    ],

    // ── 20 additional books ─────────────────────────────────────────────────
    [
      'The Secret',
      'Rhonda Byrne',
      'A self-help book based on the belief of the law of attraction, which claims that thoughts can change a person\'s life directly. The book was a global phenomenon selling over 30 million copies.',
      2,
      'https://covers.openlibrary.org/b/isbn/9781582701707-L.jpg',
    ],
    [
      'Animal Farm',
      'George Orwell',
      'A satirical allegorical novella reflecting the events leading up to the Russian Revolution, in which farm animals overthrow their human farmer only to find themselves under a new tyranny.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg',
    ],
    [
      'The Little Prince',
      'Antoine de Saint-Exupéry',
      'A poetic tale in which a pilot stranded in the desert meets a young prince who has traveled from a tiny asteroid. A beloved novella exploring themes of love, loss, and human nature.',
      7,
      'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg',
    ],
    [
      'It',
      'Stephen King',
      'A horror novel about a group of children in Derry, Maine, who are terrorized by an evil entity that exploits the fears and phobias of its victims, taking the form of a clown named Pennywise.',
      1,
      'https://covers.openlibrary.org/b/isbn/9781501142970-L.jpg',
    ],
    [
      'The Hitchhiker\'s Guide to the Galaxy',
      'Douglas Adams',
      'A comedic science fiction adventure following Arthur Dent, an ordinary man who is whisked off Earth just before it is demolished to make way for a hyperspace bypass.',
      8,
      'https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg',
    ],
    [
      'Becoming',
      'Michelle Obama',
      'A memoir by former United States First Lady Michelle Obama, chronicling her upbringing on the South Side of Chicago, her years at Princeton and Harvard Law School, and life in the White House.',
      9,
      'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg',
    ],
    [
      'The Girl with the Dragon Tattoo',
      'Stieg Larsson',
      'A crime thriller following journalist Mikael Blomkvist and hacker Lisbeth Salander as they investigate a decades-old disappearance within a wealthy Swedish family.',
      4,
      'https://covers.openlibrary.org/b/isbn/9780307949486-L.jpg',
    ],
    [
      'Rich Dad Poor Dad',
      'Robert T. Kiyosaki',
      'A personal finance book that challenges conventional wisdom about money, advocating for financial literacy, investing, and building assets rather than working for a salary.',
      2,
      'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
    ],
    [
      'The Handmaid\'s Tale',
      'Margaret Atwood',
      'A dystopian novel set in the near-future theocratic Republic of Gilead, where women are stripped of their rights and fertile women are forced to bear children for the ruling class.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780385490818-L.jpg',
    ],
    [
      'Design Patterns',
      'Gang of Four',
      'A software engineering book describing recurring solutions to common problems in software design, introducing 23 foundational design patterns that have shaped modern object-oriented programming.',
      10,
      'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
    ],
    [
      'The Kite Runner',
      'Khaled Hosseini',
      'A story of friendship, betrayal, and redemption set against the backdrop of Afghanistan from the final days of the monarchy through the Soviet invasion and the Taliban regime.',
      3,
      'https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg',
    ],
    [
      'Ikigai',
      'Héctor García',
      'A Japanese concept meaning "reason for being," this book explores how the people of Okinawa, Japan\'s longest-lived community, have found purpose and happiness through simple daily practices.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg',
    ],
    [
      'The Fault in Our Stars',
      'John Green',
      'A young adult novel about sixteen-year-old cancer patient Hazel Grace Lancaster, who is forced by her parents to attend a support group where she meets and falls in love with Augustus Waters.',
      3,
      'https://covers.openlibrary.org/b/isbn/9780525478812-L.jpg',
    ],
    [
      'Elon Musk',
      'Walter Isaacson',
      'A biography of the world\'s richest man and the entrepreneur behind Tesla, SpaceX, and X, revealing an intimate portrait of a driven, charismatic, and often volatile innovator.',
      9,
      'https://covers.openlibrary.org/b/isbn/9781982181284-L.jpg',
    ],
    [
      'JavaScript: The Good Parts',
      'Douglas Crockford',
      'A concise book that digs into the good parts of JavaScript — the features that make it a powerful and expressive language — while helping developers avoid the bad parts.',
      10,
      'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg',
    ],
    [
      'The Name of the Wind',
      'Patrick Rothfuss',
      'The first book in the Kingkiller Chronicle, following the life of Kvothe, a legendary magician, musician, and warrior who narrates his own extraordinary story to a traveling scribe.',
      8,
      'https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg',
    ],
    [
      'Outliers',
      'Malcolm Gladwell',
      'An examination of the factors that contribute to high levels of success, arguing that talent alone is not enough and that cultural background, environment, and timing play crucial roles.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780316017923-L.jpg',
    ],
    [
      'A Brief History of Time',
      'Stephen Hawking',
      'A landmark science book that takes the reader on a journey through space and time — from the big bang to black holes — explaining complex theories of cosmology in accessible language.',
      2,
      'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg',
    ],
    [
      'The Road',
      'Cormac McCarthy',
      'A post-apocalyptic novel following a father and his young son as they journey through a burned and desolate America, struggling to survive while trying to maintain their humanity.',
      1,
      'https://covers.openlibrary.org/b/isbn/9780307386458-L.jpg',
    ],
    [
      'Cracking the Coding Interview',
      'Gayle Laakmann McDowell',
      'The definitive guide for software engineering interviews, featuring 189 programming questions and solutions covering data structures, algorithms, system design, and behavioral questions.',
      10,
      'https://covers.openlibrary.org/b/isbn/9780984782857-L.jpg',
    ],
  ];

  // Clear existing books so re-seeding is safe
  await db.execute('DELETE FROM favorites');
  await db.execute('DELETE FROM books');

  for (const [title, author, description, categoryId, coverImage] of books) {
    await db.execute(
      'INSERT INTO books (title, author, description, category_id, cover_image) VALUES (?,?,?,?,?)',
      [title, author, description, categoryId, coverImage]
    );
  }
  console.log(`✓ ${books.length} books seeded with cover images`);

  // Add a few favorites for the demo user
  const [userRows] = await db.execute("SELECT id FROM users WHERE email = 'user@bookstore.com'");
  const [bookRows] = await db.execute('SELECT id FROM books ORDER BY id LIMIT 5');
  if (userRows.length > 0 && bookRows.length > 0) {
    for (const book of bookRows) {
      await db.execute(
        'INSERT IGNORE INTO favorites (user_id, book_id) VALUES (?,?)',
        [userRows[0].id, book.id]
      );
    }
    console.log('✓ Sample favorites added');
  }

  await db.end();
  console.log('\n✓ Seeding complete!');
  console.log('  Admin : admin@bookstore.com / admin123');
  console.log('  User  : user@bookstore.com  / user123');
}

main().catch((err) => { console.error(err); process.exit(1); });
