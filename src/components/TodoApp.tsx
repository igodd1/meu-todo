import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, Trash2, ListTodo } from "lucide-react";
import {
  supabase,
  fetchTodos,
  insertTodo,
  updateTodoCompleted,
  deleteTodo,
  type Todo,
} from "../lib/supabase";

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = task.trim();
    if (!value) return;
    setSubmitting(true);
    try {
      await insertTodo(value);
      setTask("");
      await load();
    } catch (err) {
      console.error("Erro ao adicionar:", err);
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleToggle = async (todo: Todo) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
      )
    );
    try {
      await updateTodoCompleted(todo.id, !todo.is_completed);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      await load();
    }
  };

  const handleDelete = async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      await load();
    }
  };

  const remaining = todos.filter((t) => !t.is_completed).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:py-20">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-indigo-600">
            <ListTodo className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Suas tarefas
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            To-Do List
          </h1>
          <p className="mt-2 text-slate-500">
            {loading
              ? "Carregando..."
              : remaining === 0
              ? "Tudo em dia. Bom trabalho!"
              : `${remaining} tarefa${remaining > 1 ? "s" : ""} pendente${
                  remaining > 1 ? "s" : ""
                }`}
          </p>
        </header>
        <form
          onSubmit={handleAdd}
          className="mb-6 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition"
        >
          <input
            ref={inputRef}
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="flex-1 bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={submitting || !task.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </form>
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando tarefas...</span>
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ListTodo className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">Nenhuma tarefa por aqui</p>
            <p className="mt-1 text-sm text-slate-500">
              Adicione sua primeira tarefa acima para começar.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <button
                  onClick={() => handleToggle(todo)}
                  aria-label={todo.is_completed ? "Desmarcar" : "Concluir"}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    todo.is_completed
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-transparent hover:border-indigo-500"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </button>
                <span
                  className={`flex-1 text-sm sm:text-base transition ${
                    todo.is_completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {todo.task}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  aria-label="Excluir"
                  className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}