import { useState, useEffect } from "react";
import { IdeaBoard, IdeaCard, IdeasSettings } from "@/types/ideas";

const STORAGE_KEY_BOARDS = "daily-haven-ideas-boards";
const STORAGE_KEY_SETTINGS = "daily-haven-ideas-settings";
const STORAGE_KEY_CURRENT_BOARD = "daily-haven-ideas-current-board";

const DEFAULT_SETTINGS: IdeasSettings = {
  defaultLayout: "freeform",
  defaultCardColor: "#fef3c7",
  enableVoting: false,
  showGrid: true,
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system"
};

export const useIdeasStorage = () => {
  const [boards, setBoards] = useState<IdeaBoard[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [settings, setSettings] = useState<IdeasSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentBoard = boards.find(b => b.id === currentBoardId) || boards[0];

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedBoards = localStorage.getItem(STORAGE_KEY_BOARDS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const storedCurrentBoardId = localStorage.getItem(STORAGE_KEY_CURRENT_BOARD);

      if (storedBoards) {
        const parsedBoards = JSON.parse(storedBoards);
        const boardsWithDates = parsedBoards.map((board: IdeaBoard) => ({
          ...board,
          createdAt: new Date(board.createdAt),
          updatedAt: new Date(board.updatedAt),
          ideas: board.ideas.map((idea: IdeaCard) => ({
            ...idea,
            createdAt: new Date(idea.createdAt),
            updatedAt: new Date(idea.updatedAt)
          }))
        }));
        setBoards(boardsWithDates);

        if (storedCurrentBoardId && boardsWithDates.find((b: IdeaBoard) => b.id === storedCurrentBoardId)) {
          setCurrentBoardId(storedCurrentBoardId);
        } else if (boardsWithDates.length > 0) {
          setCurrentBoardId(boardsWithDates[0].id);
        }
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_BOARDS, JSON.stringify(boards));
      } catch (error) {
        console.error("Error saving boards to localStorage:", error);
      }
    }
  }, [boards, isLoaded]);

  // Save current board ID
  useEffect(() => {
    if (isLoaded && currentBoardId) {
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_BOARD, currentBoardId);
      } catch (error) {
        console.error("Error saving current board ID:", error);
      }
    }
  }, [currentBoardId, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const addBoard = (board: IdeaBoard) => {
    setBoards((prev) => [...prev, board]);
    setCurrentBoardId(board.id);
  };

  const updateBoard = (id: string, updates: Partial<IdeaBoard>) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === id
          ? { ...board, ...updates, updatedAt: new Date() }
          : board
      )
    );
  };

  const deleteBoard = (id: string) => {
    setBoards((prev) => {
      const filtered = prev.filter((board) => board.id !== id);
      if (currentBoardId === id && filtered.length > 0) {
        setCurrentBoardId(filtered[0].id);
      }
      return filtered;
    });
  };

  const addIdea = (boardId: string, idea: IdeaCard) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, ideas: [...board.ideas, idea], updatedAt: new Date() }
          : board
      )
    );
  };

  const updateIdea = (boardId: string, ideaId: string, updates: Partial<IdeaCard>) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? {
              ...board,
              ideas: board.ideas.map((idea) =>
                idea.id === ideaId
                  ? { ...idea, ...updates, updatedAt: new Date() }
                  : idea
              ),
              updatedAt: new Date()
            }
          : board
      )
    );
  };

  const deleteIdea = (boardId: string, ideaId: string) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? {
              ...board,
              ideas: board.ideas.filter((idea) => idea.id !== ideaId),
              updatedAt: new Date()
            }
          : board
      )
    );
  };

  const updateSettings = (newSettings: Partial<IdeasSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    boards,
    currentBoard,
    currentBoardId,
    setCurrentBoardId,
    settings,
    isLoaded,
    addBoard,
    updateBoard,
    deleteBoard,
    addIdea,
    updateIdea,
    deleteIdea,
    updateSettings
  };
};
