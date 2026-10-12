import type { Note } from '../types';
import { CODE, FLOW, H, MATH, P, PAGE, TABLE, TIP, TREE, UL } from './base';

/** All names, numbers and ratings are fictional demo data. */
export const NOTES_A: Note[] = [
  {
    id: 'dsa-exam-revision',
    title: 'Data Structures & Algorithms — Exam Revision Guide',
    courseCode: 'COMP6048',
    courseName: 'Data Structures',
    category: 'programming',
    university: 'BINUS University',
    semester: 3,
    term: '2025/26 Even',
    creatorId: 'c-alya',
    pages: 42,
    format: 'PDF',
    access: 'pass',
    rating: 4.8,
    reviewCount: 126,
    downloads: 1840,
    weeklyDownloads: 212,
    publishedAt: '2026-06-14',
    palette: 0,
    description:
      'A compact revision guide for the Data Structures final exam: complexity tables, traversal orders, hashing, sorting trade-offs and worked past-paper style questions.',
    topics: ['Big-O analysis', 'Arrays & linked lists', 'Stacks & queues', 'Binary search trees', 'Hashing', 'Sorting algorithms', 'Graph traversal'],
    keywords: ['dsa', 'big o', 'complexity', 'bst', 'linked list', 'sorting', 'exam', 'final', 'algorithm'],
    openPages: 2,
    preview: [
      PAGE(
        'Complexity at a glance',
        H('1. Big-O cheat table'),
        TABLE(
          ['Structure', 'Access', 'Search', 'Insert', 'Delete'],
          ['Array', 'O(1)', 'O(n)', 'O(n)', 'O(n)'],
          ['Linked list', 'O(n)', 'O(n)', 'O(1)*', 'O(1)*'],
          ['Hash table', '—', 'O(1) avg', 'O(1) avg', 'O(1) avg'],
          ['Balanced BST', 'O(log n)', 'O(log n)', 'O(log n)', 'O(log n)'],
        ),
        P('* at a known position (head, or a node you already hold a reference to).'),
        H('2. Binary search'),
        CODE(
          'python',
          `
def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        ),
        TIP('Exam tip', 'Binary search needs a sorted array. Each step halves the range, so the worst case is ⌊log₂ n⌋ + 1 comparisons.'),
      ),
      PAGE(
        'Trees and traversal',
        H('3. Binary search tree walk-through'),
        P('Insert 8, 3, 10, 1, 6, 14 into an empty BST. Smaller keys go left, larger keys go right.'),
        TREE([['8'], ['3', '10'], ['1', '6', '14']], 'Resulting tree (level by level)'),
        TABLE(
          ['Order', 'Visit sequence', 'Typical use'],
          ['Inorder', 'Left → Root → Right', 'Sorted output of a BST'],
          ['Preorder', 'Root → Left → Right', 'Copying a tree'],
          ['Postorder', 'Left → Right → Root', 'Deleting a tree'],
        ),
        CODE(
          'python',
          `
def inorder(node):
    if node is None:
        return
    inorder(node.left)
    print(node.key)
    inorder(node.right)`,
        ),
        P('Inorder output for the tree above: 1, 3, 6, 8, 10, 14.'),
      ),
      PAGE(
        'Sorting summary',
        H('4. Sorting trade-offs'),
        TABLE(
          ['Algorithm', 'Best', 'Average', 'Worst', 'Stable'],
          ['Bubble sort', 'O(n)', 'O(n²)', 'O(n²)', 'Yes'],
          ['Merge sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'Yes'],
          ['Quick sort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'No'],
          ['Heap sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'No'],
        ),
        TIP('Common trap', 'Quick sort degrades to O(n²) on already-sorted input when the first element is the pivot. Say "median-of-three" in the exam.', 'coral'),
        UL('Need stability? Merge sort.', 'Need in-place and fast on average? Quick sort.', 'Need guaranteed O(n log n) and little memory? Heap sort.'),
      ),
    ],
  },
  {
    id: 'prog-python-basics',
    title: 'Algorithm & Programming — Python Basics Cheatsheet',
    courseCode: 'COMP6047',
    courseName: 'Algorithm and Programming',
    category: 'programming',
    university: 'BINUS University',
    semester: 1,
    term: '2024/25 Odd',
    creatorId: 'me',
    pages: 12,
    format: 'PDF',
    access: 'free',
    rating: 4.7,
    reviewCount: 310,
    downloads: 2140,
    weeklyDownloads: 164,
    publishedAt: '2026-02-09',
    palette: 2,
    description:
      'Twelve pages that cover everything from the first semester of programming: types, control flow, functions, lists and dictionaries, with tiny runnable examples.',
    topics: ['Variables & types', 'if / for / while', 'Functions', 'Lists & dictionaries', 'String methods', 'Reading input'],
    keywords: ['python', 'beginner', 'cheatsheet', 'basics', 'semester 1', 'programming'],
    openPages: 2,
    preview: [
      PAGE(
        'Types and control flow',
        H('Core types'),
        TABLE(
          ['Type', 'Example', 'Mutable?'],
          ['int', '42', 'No'],
          ['float', '3.14', 'No'],
          ['str', '"BINUS"', 'No'],
          ['list', '[1, 2, 3]', 'Yes'],
          ['dict', '{"nim": 2501}', 'Yes'],
        ),
        H('Loops'),
        CODE(
          'python',
          `
total = 0
for score in [80, 92, 75]:
    total += score
print(total / 3)   # 82.33...`,
        ),
        TIP('Remember', 'range(5) gives 0..4. The end value is never included.'),
      ),
      PAGE(
        'Functions and collections',
        H('Functions'),
        CODE(
          'python',
          `
def grade(score):
    if score >= 85:
        return "A"
    elif score >= 70:
        return "B"
    return "C"

marks = [grade(s) for s in [90, 72, 55]]  # ['A', 'B', 'C']`,
        ),
        UL('Use dict.get(key, default) to avoid KeyError.', 'Slicing: a[1:4] returns items 1, 2, 3.', 'Use f"{name}: {score}" for formatted strings.'),
      ),
    ],
  },
  {
    id: 'web-react-fundamentals',
    title: 'Web Programming — React Fundamentals',
    courseCode: 'IF3110',
    courseName: 'Web Programming',
    category: 'programming',
    university: 'Institut Teknologi Bandung',
    semester: 5,
    term: '2026/27 Odd',
    creatorId: 'c-bagas',
    pages: 30,
    format: 'PDF',
    access: 'pass',
    rating: 4.7,
    reviewCount: 97,
    downloads: 1420,
    weeklyDownloads: 188,
    publishedAt: '2026-09-18',
    palette: 1,
    description:
      'A practical walk-through of React for web programming courses: components, props, state, effects and forms, with short code listings you can type along with.',
    topics: ['JSX', 'Components & props', 'useState', 'useEffect', 'Lists & keys', 'Controlled forms', 'Lifting state up'],
    keywords: ['react', 'javascript', 'frontend', 'hooks', 'jsx', 'web', 'typescript'],
    openPages: 2,
    preview: [
      PAGE(
        'Components and props',
        H('1. A component is a function'),
        CODE(
          'tsx',
          `
type Props = { name: string; score: number };

function StudentRow({ name, score }: Props) {
  return (
    <li className="row">
      {name} — {score >= 70 ? "pass" : "retake"}
    </li>
  );
}`,
        ),
        UL('Props flow down, never up.', 'A component name must start with a capital letter.', 'Return one root element (or a fragment).'),
        FLOW(['<App />', '<StudentList />', '<StudentRow />'], 'Data flows parent → child through props'),
      ),
      PAGE(
        'State and effects',
        H('2. useState'),
        CODE(
          'tsx',
          `
const [count, setCount] = useState(0);
<button onClick={() => setCount(c => c + 1)}>
  Clicked {count} times
</button>`,
        ),
        H('3. useEffect'),
        CODE(
          'tsx',
          `
useEffect(() => {
  document.title = "Score: " + score;
}, [score]);   // runs when score changes`,
        ),
        TIP('Rule of hooks', 'Call hooks at the top level of a component. Never inside loops, conditions or nested functions.', 'coral'),
      ),
      PAGE(
        'Forms and lifting state',
        H('4. Controlled inputs'),
        CODE(
          'tsx',
          `
<input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>`,
        ),
        P('When two siblings need the same data, move the state to their closest common parent and pass it down as props.'),
        TIP('Quiz hint', 'If the question says "the UI does not update", look for state that is mutated directly instead of through its setter.'),
      ),
    ],
  },
  {
    id: 'oop-java-summary',
    title: 'Object-Oriented Programming — Java Concepts Summary',
    courseCode: 'COMP6175',
    courseName: 'Object Oriented Programming',
    category: 'programming',
    university: 'BINUS University',
    semester: 2,
    term: '2025/26 Even',
    creatorId: 'me',
    pages: 24,
    format: 'PDF',
    access: 'pass',
    rating: 4.4,
    reviewCount: 63,
    downloads: 186,
    weeklyDownloads: 21,
    publishedAt: '2026-04-22',
    palette: 4,
    description:
      'The four OOP pillars explained with short Java examples, plus interface vs abstract class, exceptions and collections. Written right after the final exam, so it matches the syllabus.',
    topics: ['Classes & objects', 'Inheritance', 'Polymorphism', 'Interfaces vs abstract classes', 'Exceptions', 'Collections'],
    keywords: ['java', 'oop', 'object oriented', 'inheritance', 'polymorphism', 'class'],
    openPages: 2,
    preview: [
      PAGE(
        'Classes and inheritance',
        H('Encapsulation + inheritance'),
        CODE(
          'java',
          `
public class Student {
    private String nim;          // encapsulated
    public Student(String nim) { this.nim = nim; }
    public String getNim() { return nim; }
}

public class Assistant extends Student {
    public Assistant(String nim) { super(nim); }
}`,
        ),
        TIP('Exam tip', 'Fields are private by default in good design: expose them through getters and setters only when needed.'),
      ),
      PAGE(
        'Interface vs abstract class',
        TABLE(
          ['', 'Interface', 'Abstract class'],
          ['Multiple inheritance', 'Yes', 'No'],
          ['Constructors', 'No', 'Yes'],
          ['State (fields)', 'Constants only', 'Any fields'],
          ['Use when', 'A capability ("can do")', 'A shared base ("is a")'],
        ),
        CODE(
          'java',
          `
Shape s = new Circle(2.0);
System.out.println(s.area());   // calls Circle.area()`,
        ),
        P('The call above is resolved at runtime: this is polymorphism.'),
      ),
      PAGE(
        'Exceptions and collections',
        H('try / catch / finally'),
        CODE(
          'java',
          `
try {
    int x = Integer.parseInt(input);
} catch (NumberFormatException e) {
    System.out.println("Not a number");
} finally {
    scanner.close();
}`,
        ),
        UL('ArrayList: fast random access.', 'LinkedList: fast insert/remove at ends.', 'HashMap: key → value, average O(1).'),
      ),
    ],
  },
  {
    id: 'db-sql-normalization',
    title: 'Database Systems — SQL & Normalization Guide',
    courseCode: 'COMP6799',
    courseName: 'Database Systems',
    category: 'database',
    university: 'BINUS University',
    semester: 3,
    term: '2025/26 Even',
    creatorId: 'c-dewi',
    pages: 36,
    format: 'PDF',
    access: 'pass',
    rating: 4.9,
    reviewCount: 214,
    downloads: 2310,
    weeklyDownloads: 305,
    publishedAt: '2026-08-02',
    palette: 3,
    description:
      'Everything for the Database Systems midterm and final in one guide: SELECT, JOINs, GROUP BY and subqueries, then normalization from 1NF to BCNF with fully worked tables and the traps lecturers love.',
    topics: ['SELECT & filtering', 'JOINs', 'GROUP BY & HAVING', 'Subqueries', 'Functional dependencies', '1NF to 3NF', 'BCNF'],
    keywords: ['sql', 'normalization', 'normalisation', 'join', 'bcnf', '3nf', 'query', 'mysql', 'relational'],
    openPages: 2,
    preview: [
      PAGE(
        'SELECT, JOIN and GROUP BY',
        H('1. Anatomy of a query'),
        CODE(
          'sql',
          `
SELECT   s.student_id, s.name, COUNT(e.course_id) AS courses
FROM     student s
JOIN     enrollment e ON e.student_id = s.student_id
WHERE    e.semester = 5
GROUP BY s.student_id, s.name
HAVING   COUNT(e.course_id) >= 4
ORDER BY courses DESC;`,
        ),
        FLOW(['FROM / JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'], 'Logical execution order, not the order you type it'),
        TABLE(
          ['Join', 'Keeps', 'Typical question'],
          ['INNER', 'Matching rows only', 'Which students enrolled?'],
          ['LEFT', 'All left rows + matches', 'All students, enrolled or not'],
          ['FULL', 'All rows from both', 'Audit mismatches'],
        ),
        TIP('Exam tip', 'WHERE filters rows before grouping. HAVING filters groups after aggregation.'),
      ),
      PAGE(
        'Normalization step by step',
        H('2. From messy table to 3NF'),
        P('Start: one cell holds several items, which breaks 1NF.'),
        TABLE(['order_id', 'customer', 'items'], ['101', 'Budi', 'Mouse, Keyboard'], ['102', 'Sari', 'Monitor']),
        P('After 1NF (atomic values, one fact per row):'),
        TABLE(
          ['order_id', 'customer', 'item', 'price'],
          ['101', 'Budi', 'Mouse', '85,000'],
          ['101', 'Budi', 'Keyboard', '250,000'],
          ['102', 'Sari', 'Monitor', '1,450,000'],
        ),
        MATH('item → price          (partial dependency: breaks 2NF)', 'customer → city       (transitive: breaks 3NF)'),
        UL('2NF: move price into ITEM(item, price).', '3NF: move city into CUSTOMER(customer, city).'),
      ),
      PAGE(
        'BCNF and exam traps',
        H('3. BCNF in one sentence'),
        P('A relation is in BCNF if, for every non-trivial dependency X → Y, X is a superkey.'),
        MATH('Teaches(student, course, lecturer)', 'lecturer → course     (lecturer is NOT a superkey)'),
        FLOW(['Teaches(student, course, lecturer)', 'split on lecturer → course', 'Assigned(lecturer, course) + Takes(student, lecturer)'], 'Decomposition into BCNF', true),
        TIP('Common trap', 'BCNF can lose dependency preservation. 3NF never does. Expect a question on exactly this.', 'coral'),
      ),
    ],
  },
  {
    id: 'db-joins-cheatsheet',
    title: 'Database Systems — SQL Joins Cheatsheet',
    courseCode: 'CSCM602',
    courseName: 'Database Systems',
    category: 'database',
    university: 'Universitas Indonesia',
    semester: 4,
    term: '2025/26 Even',
    creatorId: 'c-rizky',
    pages: 6,
    format: 'PDF',
    access: 'free',
    rating: 4.6,
    reviewCount: 88,
    downloads: 3120,
    weeklyDownloads: 247,
    publishedAt: '2026-03-11',
    palette: 2,
    description: 'Six pages, one job: pick the right JOIN. Side-by-side examples, the NULL traps, and set operators.',
    topics: ['INNER / LEFT / RIGHT / FULL', 'Self joins', 'UNION vs UNION ALL', 'NULL handling'],
    keywords: ['sql', 'join', 'cheatsheet', 'null', 'union', 'query', 'database'],
    openPages: 2,
    preview: [
      PAGE(
        'Choosing a join',
        H('Same tables, different question'),
        CODE(
          'sql',
          `
-- students with NO enrollment
SELECT s.name
FROM   student s
LEFT JOIN enrollment e ON e.student_id = s.student_id
WHERE  e.student_id IS NULL;`,
        ),
        TABLE(
          ['You need…', 'Use'],
          ['Only matches', 'INNER JOIN'],
          ['Everything from the left table', 'LEFT JOIN'],
          ['Rows with no partner', 'LEFT JOIN … WHERE right.key IS NULL'],
        ),
      ),
      PAGE(
        'NULL traps and set operators',
        CODE('sql', `WHERE grade = NULL     -- never true\nWHERE grade IS NULL   -- correct`),
        UL('UNION removes duplicates, UNION ALL keeps them (and is faster).', 'COUNT(*) counts rows, COUNT(col) skips NULLs.'),
        TIP('Remember', 'NULL = NULL is unknown, not true.', 'coral'),
      ),
    ],
  },
  {
    id: 'db-transactions-indexing',
    title: 'Database Systems — Transactions & Indexing Revision',
    courseCode: 'CS3304',
    courseName: 'Database Systems',
    category: 'database',
    university: 'Universitas Brawijaya',
    semester: 5,
    term: '2026/27 Odd',
    creatorId: 'c-yoga',
    pages: 28,
    format: 'PDF',
    access: 'pass',
    rating: 4.5,
    reviewCount: 41,
    downloads: 390,
    weeklyDownloads: 58,
    publishedAt: '2026-09-27',
    palette: 0,
    description: 'ACID, isolation levels and their anomalies, locking, B-tree indexes and how to read an EXPLAIN plan, all in diagrams and tables.',
    topics: ['ACID', 'Isolation levels', 'Locking & deadlocks', 'B-tree indexes', 'EXPLAIN plans'],
    keywords: ['transaction', 'acid', 'index', 'b-tree', 'isolation', 'deadlock', 'explain', 'sql', 'database'],
    openPages: 2,
    preview: [
      PAGE(
        'ACID and isolation',
        TABLE(
          ['Property', 'Meaning', 'Typically enforced by'],
          ['Atomicity', 'All or nothing', 'Write-ahead log, rollback'],
          ['Consistency', 'Constraints always hold', 'Constraints + app logic'],
          ['Isolation', 'Transactions do not see each other mid-flight', 'Locks / MVCC'],
          ['Durability', 'Committed data survives a crash', 'Log flushed to disk'],
        ),
        TABLE(
          ['Level', 'Dirty read', 'Non-repeatable', 'Phantom'],
          ['Read uncommitted', 'Possible', 'Possible', 'Possible'],
          ['Read committed', 'No', 'Possible', 'Possible'],
          ['Repeatable read', 'No', 'No', 'Possible'],
          ['Serializable', 'No', 'No', 'No'],
        ),
      ),
      PAGE(
        'Indexes and EXPLAIN',
        CODE('sql', `CREATE INDEX idx_student_name ON student(name);\nEXPLAIN SELECT * FROM student WHERE name = 'Alya';`),
        UL('A B-tree index keeps keys sorted, so lookups are O(log n).', 'Composite index (a, b) helps filters on a or on a + b, not on b alone.'),
        TIP('Exam tip', 'An index speeds reads but slows writes, because every INSERT must also update the index.', 'sun'),
      ),
      PAGE(
        'Deadlocks',
        FLOW(['T1 locks A', 'T2 locks B', 'T1 waits for B', 'T2 waits for A'], 'Circular wait = deadlock'),
        P('Detect with a wait-for graph; resolve by aborting one victim transaction.'),
      ),
    ],
  },
  {
    id: 'net-routing-tcpip',
    title: 'Computer Networks — Routing and TCP/IP',
    courseCode: 'COMP6377',
    courseName: 'Computer Networks',
    category: 'networking',
    university: 'BINUS University',
    semester: 4,
    term: '2025/26 Even',
    creatorId: 'c-michael',
    pages: 34,
    format: 'PDF',
    access: 'pass',
    rating: 4.7,
    reviewCount: 102,
    downloads: 1250,
    weeklyDownloads: 143,
    publishedAt: '2026-07-06',
    palette: 1,
    description: 'The TCP/IP stack, IP routing and transport-layer behaviour explained with diagrams and worked tables. Built for the final exam and the lab practicum.',
    topics: ['OSI vs TCP/IP', 'IP addressing', 'Static & dynamic routing', 'RIP vs OSPF', 'TCP handshake', 'Congestion control', 'DNS & HTTP'],
    keywords: ['network', 'networking', 'tcp', 'ip', 'routing', 'osi', 'ospf', 'rip', 'dns', 'http'],
    openPages: 2,
    preview: [
      PAGE(
        'Layers',
        H('1. TCP/IP vs OSI'),
        TABLE(
          ['TCP/IP layer', 'OSI layers', 'Examples'],
          ['Application', '5–7', 'HTTP, DNS, SMTP'],
          ['Transport', '4', 'TCP, UDP'],
          ['Internet', '3', 'IP, ICMP'],
          ['Link', '1–2', 'Ethernet, Wi-Fi'],
        ),
        FLOW(['Application data', 'TCP segment', 'IP packet', 'Ethernet frame'], 'Encapsulation on the sender', true),
      ),
      PAGE(
        'Routing',
        H('2. Longest prefix match'),
        TABLE(
          ['Destination', 'Next hop', 'Interface'],
          ['10.1.2.0/24', '192.168.0.2', 'eth0'],
          ['10.1.0.0/16', '192.168.0.3', 'eth0'],
          ['0.0.0.0/0', '192.168.0.1', 'eth1'],
        ),
        P('A packet to 10.1.2.77 matches all three rows. The /24 wins because it is the longest prefix.'),
        TABLE(['', 'RIP', 'OSPF'], ['Metric', 'Hop count (max 15)', 'Link cost'], ['Type', 'Distance vector', 'Link state'], ['Scales to', 'Small networks', 'Large networks']),
      ),
      PAGE(
        'TCP',
        H('3. Three-way handshake'),
        FLOW(['Client: SYN', 'Server: SYN-ACK', 'Client: ACK'], 'Connection established, then data flows'),
        MATH('cwnd doubles each RTT in slow start', 'then +1 MSS per RTT in congestion avoidance'),
        TIP('Exam tip', 'On packet loss detected by timeout, TCP drops cwnd to 1 MSS. On triple duplicate ACKs, it halves.', 'coral'),
      ),
    ],
  },
  {
    id: 'net-subnetting',
    title: 'Computer Networks — Subnetting Practice Pack',
    courseCode: 'COMP6377',
    courseName: 'Computer Networks',
    category: 'networking',
    university: 'BINUS University',
    semester: 4,
    term: '2025/26 Even',
    creatorId: 'me',
    pages: 18,
    format: 'PDF',
    access: 'pass',
    rating: 4.8,
    reviewCount: 74,
    downloads: 242,
    weeklyDownloads: 39,
    publishedAt: '2026-05-30',
    palette: 2,
    description: 'A fast method for CIDR and subnetting, followed by 20 practice questions with answers. Short, drill-focused, no filler.',
    topics: ['CIDR notation', 'Subnet masks', 'Block size method', 'VLSM', 'Practice questions'],
    keywords: ['subnet', 'subnetting', 'cidr', 'ip', 'vlsm', 'network', 'mask'],
    openPages: 2,
    preview: [
      PAGE(
        'CIDR quick table',
        TABLE(
          ['Prefix', 'Mask', 'Block size', 'Usable hosts'],
          ['/24', '255.255.255.0', '256', '254'],
          ['/25', '255.255.255.128', '128', '126'],
          ['/26', '255.255.255.192', '64', '62'],
          ['/27', '255.255.255.224', '32', '30'],
          ['/28', '255.255.255.240', '16', '14'],
        ),
        MATH('usable hosts = 2^(32 − prefix) − 2'),
        TIP('Shortcut', 'Block size = 256 − the interesting octet of the mask.'),
      ),
      PAGE(
        'Worked example',
        H('Split 192.168.10.0/24 into 4 subnets'),
        P('Borrow 2 bits, so the new prefix is /26 and the block size is 64.'),
        TABLE(
          ['Subnet', 'Network', 'First host', 'Last host', 'Broadcast'],
          ['1', '192.168.10.0', '.1', '.62', '.63'],
          ['2', '192.168.10.64', '.65', '.126', '.127'],
          ['3', '192.168.10.128', '.129', '.190', '.191'],
          ['4', '192.168.10.192', '.193', '.254', '.255'],
        ),
      ),
      PAGE(
        'Practice',
        UL('Q1. How many hosts fit in 172.16.0.0/22?', 'Q2. Which subnet does 10.0.5.130/25 belong to?', 'Q3. Design a VLSM plan for 60, 28 and 10 hosts.'),
        P('Answers and full working are on pages 14 to 18.'),
      ),
    ],
  },
];
