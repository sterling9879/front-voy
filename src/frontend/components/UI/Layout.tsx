import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  FlaskConical,
  History,
  FolderOpen,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useProjectStore } from '../../stores/project.store';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Visão Geral', href: '', icon: LayoutDashboard },
  { name: 'Board', href: '/board', icon: Kanban },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Hipóteses', href: '/hypotheses', icon: FlaskConical },
  { name: 'Timeline', href: '/timeline', icon: History },
];

export default function Layout() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentProject } = useProjectStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link to="/projects" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Voyra IA</span>
          </Link>
        </div>

        {/* Project indicator */}
        {projectId && currentProject && (
          <div className="p-4 border-b border-gray-200">
            <Link
              to="/projects"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              Projetos
              <ChevronRight className="w-4 h-4 mx-1" />
            </Link>
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentProject.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentProject.niche.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {projectId ? (
            navigation.map((item) => {
              const href = `/projects/${projectId}${item.href}`;
              const isActive = location.pathname === href;

              return (
                <Link
                  key={item.name}
                  to={href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Selecione um projeto
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
