import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

interface Task {
  id: string;
  status: 'To Do' | 'In Progress' | 'Done';
  deadline?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTasks = async () => {
      try {
        let query = supabase.from('tasks').select('id, status, deadline');

        if (user.role === 'Admin') {
          // Admin sees all tasks for projects they admin
          const { data: adminProjects } = await supabase.from('projects').select('id').eq('admin_id', user.id);
          if (adminProjects && adminProjects.length > 0) {
            query = query.in('project_id', adminProjects.map(p => p.id));
          } else {
             setTasks([]);
             setLoading(false);
             return;
          }
        } else {
          query = query.eq('assigned_to', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);

  if (loading) {
     return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;
  }

  const statCards = [
    { name: 'Total Tasks', value: tasks.length, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Completed Tasks', value: tasks.filter(t => t.status === 'Done').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Pending Tasks', value: tasks.filter(t => t.status !== 'Done').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { 
      name: 'Overdue Tasks', 
      value: tasks.filter(t => t.status !== 'Done' && t.deadline && new Date(t.deadline) < new Date()).length, 
      icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card-bg border border-card-border rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Team Dashboard</h1>
          <p className="text-[15px] text-text-muted mt-2">Overview of your current workflow and task statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="group bg-card-bg border border-card-border backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-center gap-2 hover:-translate-y-1 transition-all duration-300 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">{stat.name}</span>
                 <div className={`p-2 rounded-xl transition-colors duration-300 ${
                   stat.name === 'Completed Tasks' ? 'bg-green-500/10 group-hover:bg-green-500/20' : 
                   stat.name === 'Pending Tasks' ? 'bg-amber-500/10 group-hover:bg-amber-500/20' : 
                   stat.name === 'Overdue Tasks' ? 'bg-red-500/10 group-hover:bg-red-500/20' : 
                   'bg-blue-500/10 group-hover:bg-blue-500/20'
                 }`}>
                   <Icon className={`h-5 w-5 ${
                     stat.name === 'Completed Tasks' ? 'text-green-400' : 
                     stat.name === 'Pending Tasks' ? 'text-amber-400' : 
                     stat.name === 'Overdue Tasks' ? 'text-red-400' : 
                     'text-blue-400'
                   }`} aria-hidden="true" />
                 </div>
              </div>
              <span className={`text-4xl font-bold tracking-tight ${
                stat.name === 'Completed Tasks' ? 'text-green-500' : 
                stat.name === 'Pending Tasks' ? 'text-amber-500' : 
                stat.name === 'Overdue Tasks' ? 'text-red-500' : 
                'text-text-main'
              }`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="bg-card-bg border border-card-border rounded-3xl p-8 backdrop-blur-xl lg:col-span-4 shadow-xl">
         <h2 className="text-xl font-bold text-text-main mb-4 tracking-tight flex items-center gap-2">
           <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm">💡</span>
           Getting Started
         </h2>
         <div className="space-y-4">
           <p className="text-[15px] text-text-main/80 leading-relaxed">
             Welcome to TeamTaskScheduler! If you are an Admin, head over to the <strong className="text-text-main font-medium">Projects</strong> tab to create your first project and add team members. Then, start assigning tasks in the <strong className="text-text-main font-medium">Tasks</strong> tab.
           </p>
           <p className="text-[15px] text-text-main/80 leading-relaxed">
             If you are a member, your assigned projects and tasks will appear automatically as they are assigned to you by your administrator.
           </p>
         </div>
      </div>
    </div>
  );
}
