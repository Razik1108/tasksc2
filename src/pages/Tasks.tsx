import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, Edit2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: any;
  status: 'To Do' | 'In Progress' | 'Done';
  deadline: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      let tasksQuery = supabase.from('tasks').select('*');
      
      if (user?.role === 'Admin') {
         const { data: pData } = await supabase.from('projects').select('*').eq('admin_id', user.id);
         setProjects(pData || []);
         
         const projectIds = (pData || []).map(p => p.id);
         if (projectIds.length > 0) {
            tasksQuery = tasksQuery.in('project_id', projectIds);
         } else {
            // No projects, so no tasks
            setTasks([]);
            setLoading(false);
            return;
         }
         
         const { data: uData } = await supabase.from('users').select('id, name, email');
         setUsers(uData || []);
      } else {
         tasksQuery = tasksQuery.eq('assigned_to', user?.id);
      }
      
      const { data: tData, error: tErr } = await tasksQuery;
      if (tErr) throw tErr;
      
      // Match with users
      const { data: allUsers } = await supabase.from('users').select('id, name');
      const usersMap = new Map((allUsers || []).map(u => [u.id, u]));

      setTasks((tData || []).map(t => ({
         id: t.id,
         title: t.title,
         description: t.description,
         projectId: t.project_id,
         assignedTo: usersMap.get(t.assigned_to) || { id: t.assigned_to, name: 'Unknown' },
         status: t.status,
         deadline: t.deadline
      })));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert([{
         title,
         description,
         project_id: projectId,
         assigned_to: assignedTo || null,
         deadline: deadline || null,
         status: 'To Do'
      }]);
      if (error) throw error;
      
      loadData();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
     setTitle('');
     setDescription('');
     setProjectId('');
     setAssignedTo('');
     setDeadline('');
  }

  const handleDelete = async (id: string) => {
     if(!confirm('Delete this task?')) return;
     try {
       const { error } = await supabase.from('tasks').delete().eq('id', id);
       if (error) throw error;
       setTasks(tasks.filter(t => t.id !== id));
     } catch (err: any) {
       alert(err.message);
     }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
     try {
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
     } catch (err: any) {
        alert(err.message);
     }
  }

  const statusColors = {
      'To Do': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      'Done': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-text-main">Tasks</h1>
           <p className="text-[15px] text-text-muted mt-2">Track and manage your team's action items.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
             onClick={() => setShowForm(!showForm)}
             className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg text-[15px] font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-blue-600/20 hover:shadow-blue-500/30"
          >
             <Plus className="w-5 h-5 mr-2" />
             New Task
          </button>
        )}
      </div>

      {showForm && user?.role === 'Admin' && (
        <div className="bg-card-bg p-8 rounded-3xl border border-card-border shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
           <h3 className="text-xl font-semibold text-text-main mb-6">Create New Task</h3>
           <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                     <label className="block text-sm font-medium text-text-main/80 mb-2">Title</label>
                     <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted" placeholder="e.g. Design wireframes" />
                  </div>
                  <div className="sm:col-span-2">
                     <label className="block text-sm font-medium text-text-main/80 mb-2">Description</label>
                     <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted resize-none" placeholder="Task details..." />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-text-main/80 mb-2">Project</label>
                     <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted">
                        <option value="" className="bg-bg-color text-text-muted">Select a project...</option>
                        {projects.map(p => <option key={p.id} value={p.id} className="bg-bg-color">{p.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-text-main/80 mb-2">Assignee</label>
                     <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted">
                        <option value="" className="bg-bg-color text-text-muted">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id} className="bg-bg-color">{u.name}</option>)}
                     </select>
                  </div>
                  <div className="sm:col-span-2">
                     <label className="block text-sm font-medium text-text-main/80 mb-2">Deadline</label>
                     <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted [color-scheme:dark]" />
                  </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                 <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-card-border text-[15px] font-medium rounded-full text-text-main/80 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 text-[15px] font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-blue-600/20">Save Task</button>
              </div>
           </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 flex items-center justify-center text-text-muted">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
          <span className="ml-3 font-medium">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card-bg rounded-3xl border border-card-border border-dashed backdrop-blur-xl">
          <div className="w-16 h-16 bg-input-bg rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-main tracking-tight">No tasks</h3>
          <p className="mt-2 text-[15px] text-text-muted">You don't have any tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start relative">
           {['To Do', 'In Progress', 'Done'].map(columnStatus => (
               <div key={columnStatus} className="bg-card-bg rounded-3xl p-5 border border-card-border shadow-xl backdrop-blur-sm max-h-[800px] flex flex-col">
                  <h3 className="font-semibold text-text-main/90 mb-5 flex items-center justify-between tracking-tight text-[15px]">
                     <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          columnStatus === 'To Do' ? 'bg-slate-400' :
                          columnStatus === 'In Progress' ? 'bg-amber-400' :
                          'bg-green-400'
                        }`}></div>
                        {columnStatus}
                     </div>
                     <span className="bg-input-bg border border-card-border text-text-muted py-0.5 px-2.5 rounded-full text-[11px] font-bold">
                        {tasks.filter(t => t.status === columnStatus).length}
                     </span>
                  </h3>
                  <div className="space-y-4 overflow-y-auto pr-1">
                     {tasks.filter(t => t.status === columnStatus).map(task => (
                        <div key={task.id} className="bg-input-bg p-5 rounded-2xl shadow-md border border-card-border transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-text-main text-[15px] tracking-tight pr-4">{task.title}</h4>
                              {user?.role === 'Admin' && (
                                 <button onClick={() => handleDelete(task.id)} className="p-1 -mt-1 -mr-1 rounded-full text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 outline-none flex-shrink-0">
                                    <Trash2 className="w-[15px] h-[15px]"/>
                                 </button>
                              )}
                           </div>
                           {task.description && (
                              <p className="text-[13px] text-text-muted mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                           )}
                           
                           <div className="flex md:flex-col lg:flex-row items-center lg:justify-between gap-3 text-xs text-text-muted mt-4 h-[24px]">
                              {task.deadline && (
                                 <span className={cn("flex items-center px-2 py-1 rounded-md bg-input-bg border border-card-border", new Date(task.deadline) < new Date() && task.status !== 'Done' ? 'text-red-500 bg-red-500/10 border-red-500/20 font-medium' : '')}>
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                    {new Date(task.deadline).toLocaleDateString()}
                                 </span>
                              )}
                              {task.assignedTo && typeof task.assignedTo === 'object' && (
                                 <div className="flex items-center gap-1.5 bg-input-bg border border-card-border px-2 py-1 rounded-md ml-auto md:ml-0 lg:ml-auto max-w-[130px]" title={task.assignedTo.name}>
                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white uppercase flex-shrink-0">
                                      {task.assignedTo.name.substring(0,2)}
                                    </div>
                                    <span className="truncate">
                                      {task.assignedTo.name}
                                    </span>
                                 </div>
                              )}
                           </div>

                           {/* Status Changer */}
                           <div className="mt-4 pt-3 border-t border-card-border">
                               <select 
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className={cn("text-[11px] uppercase tracking-wider font-semibold rounded-lg border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer block w-full py-2 px-3 transition-colors appearance-none", statusColors[task.status])}
                                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em 1em', paddingRight: '2.5rem' }}
                               >
                                  <option value="To Do" className="bg-bg-color text-text-main">To Do</option>
                                  <option value="In Progress" className="bg-bg-color text-text-main">In Progress</option>
                                  <option value="Done" className="bg-bg-color text-text-main">Done</option>
                               </select>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
           ))}
        </div>
      )}
    </div>
  );
}
