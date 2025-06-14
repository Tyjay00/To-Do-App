class TodoApp {
  constructor({ inputSelector, addBtnSelector, listSelector, filterSelector, themeToggleSelector, storageKey = 'todos' }) {
    this.input           = document.querySelector(inputSelector);
    this.addBtn          = document.querySelector(addBtnSelector);
    this.list            = document.querySelector(listSelector);
    this.filters         = document.querySelectorAll(filterSelector);
    this.themeToggle     = document.querySelector(themeToggleSelector);
    this.storageKey      = storageKey;
    this.todos           = [];
    this.currentFilter   = 'all';
    this.editIndex       = null;

    this.loadTheme();
    this.loadTodos();
    this.bindEvents();
    this.updateCounts();
  }

  bindEvents() {
    // Add / Edit
    this.addBtn.addEventListener('click', () => this.onAddOrEdit());
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.onAddOrEdit();
    });

    // Todo list actions (toggle, edit, delete)
    this.list.addEventListener('click', e => this.onListClick(e));

    // Filter buttons
    this.filters.forEach(btn =>
      btn.addEventListener('click', e => {
        this.currentFilter = e.target.dataset.filter;
        this.filters.forEach(b => b.classList.toggle('active', b === e.target));
        this.render();
      })
    );

    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  onAddOrEdit() {
    const text = this.input.value.trim();
    if (!text) {
      alert('Please enter a task.');
      return;
    }

    if (this.editIndex !== null) {
      // Update existing
      this.todos[this.editIndex].text = text;
      this.editIndex = null;
      this.addBtn.textContent = 'Add';
    } else {
      // New todo
      this.todos.push({ text, done: false });
    }

    this.saveTodos();
    this.input.value = '';
    this.render();
    this.updateCounts();
    this.input.focus();
  }

  onListClick(e) {
    const li = e.target.closest('li');
    if (!li) return;
    const idx = Number(li.dataset.index);

    if (e.target.classList.contains('toggle')) {
      this.todos[idx].done = !this.todos[idx].done;
      this.saveTodos();
      this.render();
      this.updateCounts();
    }

    else if (e.target.classList.contains('edit')) {
      this.input.value = this.todos[idx].text;
      this.editIndex = idx;
      this.addBtn.textContent = 'Edit';
      this.input.focus();
    }

    else if (e.target.classList.contains('delete')) {
      this.deleteWithAnimation(idx, li);
    }
  }

  deleteWithAnimation(idx, liElement) {
    liElement.animate([
      { opacity: 1, height: liElement.offsetHeight + 'px' },
      { opacity: 0, height: '0px' }
    ], { duration: 200, easing: 'ease-in' })
    .onfinish = () => {
      this.todos.splice(idx, 1);
      this.saveTodos();
      this.render();
      this.updateCounts();
    };
  }

  saveTodos() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
  }

  loadTodos() {
    try {
      this.todos = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      this.todos = [];
    }
    this.render();
  }

  render() {
    this.list.innerHTML = '';
    this.todos.forEach((todo, i) => {
      // apply filter
      if (this.currentFilter === 'active' && todo.done) return;
      if (this.currentFilter === 'completed' && !todo.done) return;

      const li = document.createElement('li');
      li.dataset.index = i;
      if (todo.done) li.classList.add('completed');

      const p = document.createElement('p');
      p.textContent = todo.text;
      li.appendChild(p);

      // toggle done
      const toggle = document.createElement('button');
      toggle.textContent = todo.done ? '↺' : '✓';
      toggle.title = todo.done ? 'Mark as Undone' : 'Mark as Done';
      toggle.className = 'btn toggle';
      li.appendChild(toggle);

      // edit
      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'btn edit';
      edit.setAttribute('aria-label', `Edit todo ${todo.text}`);
      li.appendChild(edit);

      // delete
      const del = document.createElement('button');
      del.textContent = 'Remove';
      del.className = 'btn delete';
      del.setAttribute('aria-label', `Remove todo ${todo.text}`);
      li.appendChild(del);

      this.list.appendChild(li);

      // entrance animation
      li.animate([
        { opacity: 0, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 200, easing: 'ease-out' });
    });
  }

  updateCounts() {
    const total  = this.todos.length;
    const done   = this.todos.filter(t => t.done).length;
    const active = total - done;
    document.getElementById('countAll').textContent    = total;
    document.getElementById('countActive').textContent = active;
    document.getElementById('countDone').textContent   = done;
  }

  loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.dataset.theme = saved;
    this.themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
  }

  toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    this.themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp({
    inputSelector:     '#inputBox',
    addBtnSelector:    '#addBtn',
    listSelector:      '#todoList',
    filterSelector:    '.filters button',
    themeToggleSelector: '#themeToggle'
  });
});
