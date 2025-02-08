
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2 } from 'lucide-react';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SavedTab {
  id: string;
  title: string;
  url: string;
}

interface SavedTabsListProps {
  tabs: SavedTab[];
  onOpenTab: (url: string) => void;
  onDeleteTab: (id: string) => void;
}

const ITEMS_PER_PAGE = 8;

const SavedTabsList = ({ tabs, onOpenTab, onDeleteTab }: SavedTabsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(tabs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleTabs = tabs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <div className="divide-y divide-gray-100">
          {visibleTabs.map((tab) => (
            <div 
              key={tab.id} 
              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onOpenTab(tab.url)}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {tab.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {tab.url}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onOpenTab(tab.url)}
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-red-500"
                  onClick={() => onDeleteTab(tab.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {tabs.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              No saved tabs in this category yet.
            </div>
          )}
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SavedTabsList;

