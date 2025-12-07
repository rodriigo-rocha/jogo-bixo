import { AlertOctagon, AlertTriangle, CheckCircle, Info, X} from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

// Estilos inspirados no Windows 98
const win98Styles = {
  window:
    "bg-[#c0c0c0] border-t-white border-l-white border-r-black border-b-black border-2 shadow-md",
  titleBar:
    "bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-1 py-0.5 flex justify-between items-center select-none",
  button:
    "bg-[#c0c0c0] active:border-t-black active:border-l-black active:border-r-white active:border-b-white border-t-white border-l-white border-r-black border-b-black border-2 flex items-center justify-center active:bg-[#b0b0b0]",
  content: "p-3 flex items-start gap-3 text-black font-sans text-sm",
};

// Ícones e títulos padrão para cada tipo de notificação
const icons = {
  info: <Info size={24} className="text-blue-700" />,
  success: <CheckCircle size={24} className="text-green-700" />,
  warning: <AlertTriangle size={24} className="text-yellow-600" />,
  error: <AlertOctagon size={24} className="text-red-600" />,
};

// Títulos padrão para cada tipo de notificação
const titles = {
  info: "Informação",
  success: "Sucesso",
  warning: "Atenção",
  error: "Erro Crítico",
};

// Criação do contexto de notificações
const NotificationContext = createContext();

// Hook personalizado para usar o contexto de notificações
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification deve ser usado dentro de um NotificationProvider");

  return context;
};

// Componente Toast individual para cada notificação
const Toast = ({ id, type, title, message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 200);
  };

  return (
    <div
      className={`
        mb-4 w-80 transition-all duration-200 ease-in-out transform 
        ${isClosing ? "opacity-0 scale-90 translate-x-full" : "opacity-100 scale-100 translate-x-0"}
        ${win98Styles.window}
      `}
      role="alert"
    >
      {/* Barra de Título */}
      <div className={win98Styles.titleBar}>
        <span className="font-bold text-xs tracking-wide flex gap-2 items-center">
          {title || titles[type]}
        </span>
        <button
          type="button"
          onClick={handleClose}
          className={`w-4 h-4 ${win98Styles.button} p-0 leading-none text-xs font-bold text-black`}
          aria-label="Fechar"
        >
          <X size={10} strokeWidth={3} />
        </button>
      </div>

      {/* Conteúdo do Corpo */}
      <div className={win98Styles.content}>
        <div className="flex-shrink-0 mt-1">{icons[type]}</div>
        <div className="flex-grow">
          <p className="leading-snug">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Provedor de Notificações que gerencia o estado e exibição dos toasts
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Função para remover uma notificação pelo ID
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Função para adicionar uma nova notificação
  const addNotification = useCallback(
    (type, message, title = null, duration = 5000) => {
      const id = Date.now() + Math.random();
      
      setNotifications((prev) => [...prev, { id, type, message, title }]);

      // Remover a notificação após a duração especificada
      if (duration) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    [removeNotification],
  );

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification }}
    >
      {children}

      {/* Container Fixo para os Toasts (Z-Index alto para ficar sobre tudo) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
        {/* pointer-events-auto no filho para permitir clicar nos toasts mas não bloquear a tela */}
        <div className="pointer-events-auto">
          {notifications.map((notif) => (
            <Toast key={notif.id} {...notif} onClose={removeNotification} />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
