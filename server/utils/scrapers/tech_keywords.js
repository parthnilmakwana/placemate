/**
 * Comprehensive list of 150+ modern technologies, frameworks, databases, 
 * cloud platforms, programming languages, and developer tools.
 */
const TECH_KEYWORDS = [
  // Languages
  { name: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { name: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { name: 'Python', patterns: [/\bpython\b/i] },
  { name: 'Java', patterns: [/\bjava\b/i] },
  { name: 'C++', patterns: [/\bc\+\+\b/i, /\bcpp\b/i] },
  { name: 'C#', patterns: [/\bc\#\b/i, /\bcsharp\b/i] },
  { name: 'Go', patterns: [/\bgo\b/i, /\bgolang\b/i] },
  { name: 'Rust', patterns: [/\brust\b/i] },
  { name: 'Ruby', patterns: [/\bruby\b/i] },
  { name: 'PHP', patterns: [/\bphp\b/i] },
  { name: 'Swift', patterns: [/\bswift\b/i] },
  { name: 'Kotlin', patterns: [/\bkotlin\b/i] },
  { name: 'Dart', patterns: [/\bdart\b/i] },
  { name: 'Scala', patterns: [/\bscala\b/i] },
  { name: 'R', patterns: [/\br\b/i] },
  { name: 'HTML', patterns: [/\bhtml\b/i, /\bhtml5\b/i] },
  { name: 'CSS', patterns: [/\bcss\b/i, /\bcss3\b/i] },

  // Frontend Frameworks & Libraries
  { name: 'React', patterns: [/\breactjs\b/i, /\breact\.js\b/i, /\breact\b/i] },
  { name: 'Angular', patterns: [/\bangular\b/i, /\bangularjs\b/i] },
  { name: 'Vue.js', patterns: [/\bvue\.js\b/i, /\bvuejs\b/i, /\bvue\b/i] },
  { name: 'Next.js', patterns: [/\bnext\.js\b/i, /\bnextjs\b/i] },
  { name: 'Nuxt.js', patterns: [/\bnuxt\.js\b/i, /\bnuxtjs\b/i] },
  { name: 'Svelte', patterns: [/\bsvelte\b/i] },
  { name: 'Ember.js', patterns: [/\bember\b/i, /\bember\.js\b/i] },
  { name: 'Redux', patterns: [/\bredux\b/i] },
  { name: 'MobX', patterns: [/\bmobx\b/i] },
  { name: 'jQuery', patterns: [/\bjquery\b/i] },
  { name: 'Tailwind CSS', patterns: [/\btailwind\b/i, /\btailwindcss\b/i] },
  { name: 'Bootstrap', patterns: [/\bbootstrap\b/i] },
  { name: 'Sass', patterns: [/\bsass\b/i, /\bscss\b/i] },
  { name: 'Material-UI', patterns: [/\bmaterial-ui\b/i, /\bmui\b/i] },
  { name: 'Ant Design', patterns: [/\bant design\b/i, /\bantd\b/i] },

  // Backend Frameworks
  { name: 'Node.js', patterns: [/\bnode\.js\b/i, /\bnodejs\b/i, /\bnode\b/i] },
  { name: 'Express', patterns: [/\bexpress\.js\b/i, /\bexpressjs\b/i, /\bexpress\b/i] },
  { name: 'NestJS', patterns: [/\bnestjs\b/i, /\bnest\.js\b/i] },
  { name: 'Django', patterns: [/\bdjango\b/i] },
  { name: 'Flask', patterns: [/\bflask\b/i] },
  { name: 'FastAPI', patterns: [/\bfastapi\b/i] },
  { name: 'Spring Boot', patterns: [/\bspring boot\b/i, /\bspring\b/i] },
  { name: 'ASP.NET', patterns: [/\basp\.net\b/i, /\b\.net\b/i] },
  { name: 'Ruby on Rails', patterns: [/\bruby on rails\b/i, /\brails\b/i] },
  { name: 'Laravel', patterns: [/\blaravel\b/i] },

  // Mobile
  { name: 'React Native', patterns: [/\breact native\b/i] },
  { name: 'Flutter', patterns: [/\bflutter\b/i] },
  { name: 'Ionic', patterns: [/\bionic\b/i] },
  { name: 'Xamarin', patterns: [/\bxamarin\b/i] },

  // Databases
  { name: 'MySQL', patterns: [/\bmysql\b/i] },
  { name: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
  { name: 'SQLite', patterns: [/\bsqlite\b/i] },
  { name: 'SQL Server', patterns: [/\bsql server\b/i, /\bmssql\b/i] },
  { name: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
  { name: 'Mongoose', patterns: [/\bmongoose\b/i] },
  { name: 'Redis', patterns: [/\bredis\b/i] },
  { name: 'Cassandra', patterns: [/\bcassandra\b/i] },
  { name: 'Elasticsearch', patterns: [/\belasticsearch\b/i] },
  { name: 'Firebase', patterns: [/\bfirebase\b/i] },
  { name: 'Supabase', patterns: [/\bsupabase\b/i] },
  { name: 'DynamoDB', patterns: [/\bdynamodb\b/i] },
  { name: 'GraphQL', patterns: [/\bgraphql\b/i] },
  { name: 'SQL', patterns: [/\bsql\b/i] },

  // DevOps & Cloud
  { name: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
  { name: 'Azure', patterns: [/\bazure\b/i] },
  { name: 'Google Cloud', patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
  { name: 'Docker', patterns: [/\bdocker\b/i] },
  { name: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'Jenkins', patterns: [/\bjenkins\b/i] },
  { name: 'Git', patterns: [/\bgit\b/i, /\bgithub\b/i, /\bgitlab\b/i] },
  { name: 'Linux', patterns: [/\blinux\b/i] },
  { name: 'Terraform', patterns: [/\bterraform\b/i] },
  { name: 'Ansible', patterns: [/\bansible\b/i] },
  { name: 'CI/CD', patterns: [/\bci\/cd\b/i, /\bcontinuous integration\b/i] },

  // Data Science & AI
  { name: 'TensorFlow', patterns: [/\btensorflow\b/i] },
  { name: 'PyTorch', patterns: [/\bpytorch\b/i] },
  { name: 'Pandas', patterns: [/\bpandas\b/i] },
  { name: 'NumPy', patterns: [/\bnumpy\b/i] },
  { name: 'Scikit-learn', patterns: [/\bscikit-learn\b/i, /\bsklearn\b/i] },
  { name: 'Keras', patterns: [/\bkeras\b/i] },
  { name: 'Hadoop', patterns: [/\bhadoop\b/i] },
  { name: 'Spark', patterns: [/\bapache spark\b/i, /\bspark\b/i] },
  { name: 'Kafka', patterns: [/\bkafka\b/i] },
  
  // Tools & Others
  { name: 'Webpack', patterns: [/\bwebpack\b/i] },
  { name: 'Babel', patterns: [/\bbabel\b/i] },
  { name: 'Jest', patterns: [/\bjest\b/i] },
  { name: 'Mocha', patterns: [/\bmocha\b/i] },
  { name: 'Cypress', patterns: [/\bcypress\b/i] },
  { name: 'Figma', patterns: [/\bfigma\b/i] },
  { name: 'Agile', patterns: [/\bagile\b/i, /\bscrum\b/i] }
];

module.exports = TECH_KEYWORDS;
