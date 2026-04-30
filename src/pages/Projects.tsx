import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Users, FolderKanban } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  admin: any;
  members: any[];
}

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]); // All users for adding to project
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      let projectsQuery = supabase.from('projects').select('*');
      
      if (user?.role === 'Admin') {
         projectsQuery = projectsQuery.eq('admin_id', user.id);
         
         const { data: allUsers } = await supabase.from('users').select('id, name, email').neq('id', user.id);
         setUsers(allUsers || []);
      } else {
         // Members only see their projects
         projectsQuery = projectsQuery.contains('members', [user?.id]);
      }
      
      const { data: projectsData, error: projError } = await projectsQuery;
      if (projError) throw projError;
      
      // We also need user details for displaying member initials
      const { data: allMemberData } = await supabase.from('users').select('id, name');
      const usersMap = new Map((allMemberData || []).map(u => [u.id, u]));

      setProjects((projectsData || []).map(p => ({
         id: p.id,
         name: p.name,
         admin: p.admin_id,
         members: Array.isArray(p.members) ? p.members.map(mId => usersMap.get(mId) || { id: mId, name: 'Unknown' }) : []
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
      const { error } = await supabase.from('projects').insert([{
         name,
         members: selectedMembers,
         admin_id: user?.id
      }]);
      if (error) throw error;
      
      loadData();
      setShowForm(false);
      setName('');
      setSelectedMembers([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
     if(!confirm('Delete this project?')) return;
     try {
       const { error } = await supabase.from('projects').delete().eq('id', id);
       if (error) throw error;
       setProjects(projects.filter(p => p.id !== id));
     } catch (err: any) {
       alert(err.message);
     }
  };

  const toggleMember = (uid: string) => {
     setSelectedMembers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-text-main">Projects</h1>
           <p className="text-[15px] text-text-muted mt-2">Manage workspaces and their team members.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
             onClick={() => setShowForm(!showForm)}
             className="inline-flex items-center justify-center px-5 py-2.5 shadow-lg text-[15px] font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-blue-600/20 hover:shadow-blue-500/30"
          >
             <Plus className="w-5 h-5 mr-2" />
             New Project
          </button>
        )}
      </div>

      {showForm && user?.role === 'Admin' && (
        <div className="bg-card-bg p-8 rounded-3xl border border-card-border shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
           <h3 className="text-xl font-semibold text-text-main mb-6">Create New Project</h3>
           <form onSubmit={handleCreate} className="space-y-5">
              <div>
                 <label className="block text-sm font-medium text-text-main/80 mb-2">Project Name</label>
                 <input
                   type="text" required value={name} onChange={e => setName(e.target.value)}
                   className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-text-main transition-all duration-300 placeholder-text-muted"
                   placeholder="e.g. Website Redesign"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-text-main/80 mb-2">Assign Members</label>
                 <div className="border border-card-border rounded-2xl max-h-56 overflow-y-auto divide-y divide-card-border bg-input-bg shadow-inner">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="relative flex items-center justify-center">
                          <input
                             type="checkbox"
                             className="peer h-5 w-5 appearance-none rounded border border-card-border bg-card-bg checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-bg-color transition-all duration-200 cursor-pointer"
                             checked={selectedMembers.includes(u.id)}
                             onChange={() => toggleMember(u.id)}
                          />
                          <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                              <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                           <span className="block text-sm font-medium text-text-main group-hover:text-blue-500 transition-colors">{u.name}</span>
                           <span className="block text-[13px] text-text-muted">{u.email}</span>
                        </div>
                      </label>
                    ))}
                    {users.length === 0 && <div className="p-5 text-sm text-text-muted text-center">No other users found in the system.</div>}
                 </div>
               </div>
              <div className="flex justify-end gap-3 pt-2">
                 <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-card-border text-[15px] font-medium rounded-full text-text-main/80 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">Cancel</button>
                 <button type="submit" className="px-5 py-2.5 text-[15px] font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-blue-600/20">Save Project</button>
              </div>
           </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 flex items-center justify-center text-text-muted">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
          <span className="ml-3 font-medium">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card-bg rounded-3xl border border-card-border border-dashed backdrop-blur-xl">
          <div className="w-16 h-16 bg-input-bg rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-main tracking-tight">No projects found</h3>
          <p className="mt-2 text-[15px] text-text-muted">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <div key={project.id} className="group bg-card-bg border border-card-border backdrop-blur-xl rounded-3xl flex flex-col p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-text-main tracking-tight truncate pr-4">{project.name}</h3>
                {user?.role === 'Admin' && project.admin === user.id && (
                   <button onClick={() => handleDelete(project.id)} className="p-2 -mr-2 rounded-full text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 outline-none">
                      <Trash2 className="w-4 h-4"/>
                   </button>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-card-border">
                <div className="flex items-center text-[11px] text-text-muted uppercase tracking-widest font-semibold mb-3">
                   <Users className="w-3.5 h-3.5 mr-2 opacity-70" />
                   {project.members?.length || 0} Members
                </div>
                {project.members && project.members.length > 0 && (
                  <div className="flex -space-x-3 overflow-hidden items-center py-1">
                     {project.members.map((m: any, i) => (
                        <div key={m.id || i} className="inline-block h-9 w-9 rounded-full ring-2 ring-bg-color bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm transition-transform hover:z-10 hover:-translate-y-1" title={m.name}>
                          {m.name?.substring(0,2).toUpperCase()}
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
