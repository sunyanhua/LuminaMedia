import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import { SidebarProvider } from './components/ui/sidebar';

function App() {
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
}

export default App;
