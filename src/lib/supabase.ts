import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.");
}

export type Todo = {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Todo[];
}

export async function insertTodo(task: string): Promise<void> {
  const { error } = await supabase.from("todos").insert({ task });
  if (error) throw error;
}

export async function updateTodoCompleted(id: number, is_completed: boolean): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ is_completed })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTodo(id: number): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}