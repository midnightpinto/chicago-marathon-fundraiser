// Simple in-memory database for testing
const inMemoryDB = {
  users: [
    {
      user_id: 1,
      email: 'admin@example.com',
      password_hash: '$2b$10$x5/o/kIkmF7Y3XfrZ7VeEehNlxG7mT.i0vVk83cQBjk0qw9q/Ngp6', // password: admin123
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ],
  courses: [],
  performance_reviews: [],
  self_assessments: [],
  manager_assessments: []
};

// Simple query function to mimic MySQL queries
const query = async (sql, params = []) => {
  // Simple parsing of SQL queries for basic operations
  if (sql.toLowerCase().includes('select * from users where email =')) {
    const email = params[0];
    const user = inMemoryDB.users.find(u => u.email === email);
    return [[user || []]];
  }
  
  if (sql.toLowerCase().includes('insert into users')) {
    const [email, passwordHash, firstName, lastName, role] = params;
    const newUser = {
      user_id: inMemoryDB.users.length + 1,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name,
      role,
      created_at: new Date().toISOString()
    };
    inMemoryDB.users.push(newUser);
    return [{ insertId: newUser.user_id }];
  }

  if (sql.toLowerCase().includes('select * from courses')) {
    return [inMemoryDB.courses];
  }

  if (sql.toLowerCase().includes('insert into courses')) {
    const [title, description, createdBy, status] = params;
    const newCourse = {
      course_id: inMemoryDB.courses.length + 1,
      title,
      description,
      created_by: createdBy,
      status,
      created_at: new Date().toISOString()
    };
    inMemoryDB.courses.push(newCourse);
    return [{ insertId: newCourse.course_id }];
  }

  if (sql.toLowerCase().includes('select * from courses where course_id =')) {
    const id = params[0];
    const course = inMemoryDB.courses.find(c => c.course_id === Number(id));
    return [[course || []]];
  }

  if (sql.toLowerCase().includes('update courses set')) {
    const id = params[3];
    const index = inMemoryDB.courses.findIndex(c => c.course_id === Number(id));
    if (index !== -1) {
      inMemoryDB.courses[index] = {
        ...inMemoryDB.courses[index],
        title: params[0],
        description: params[1],
        status: params[2]
      };
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  if (sql.toLowerCase().includes('delete from courses')) {
    const id = params[0];
    const initialLength = inMemoryDB.courses.length;
    inMemoryDB.courses = inMemoryDB.courses.filter(c => c.course_id !== Number(id));
    return [{ affectedRows: initialLength - inMemoryDB.courses.length }];
  }

  return [[]];
};

module.exports = {
  query,
  // Add a method to get the actual data for debugging
  getDB: () => inMemoryDB
};