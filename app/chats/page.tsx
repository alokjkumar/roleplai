import { MessageSquare } from 'lucide-react';

export default function ChatsPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-3">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
        <h2 className="text-lg font-medium text-foreground">No chat selected</h2>
        <p className="text-sm text-muted-foreground">
          Create a new chat or select one from the sidebar.
        </p>
      </div>
    </div>
  );
}
