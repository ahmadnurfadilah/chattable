"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PencilEdit02Icon,
  PlusSignIcon,
  Settings01Icon,
  MoreVerticalCircle01Icon,
  Delete01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import {
  getMenuCategories,
  updateCategoryOrder,
  updateCategoryName,
  createCategory,
  deleteCategory,
} from "@/lib/actions/menu-category";
import { getMenus } from "@/lib/actions/menu";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  orderColumn: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Menu = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  categoryName: string;
};

export default function MenuPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async () => {
    try {
      const data = await getMenuCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadMenus = async () => {
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (error) {
      console.error("Failed to load menus:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadCategories();
        await loadMenus();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (editingCategoryId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCategoryId]);

  useEffect(() => {
    if (isAddingCategory && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingCategory]);

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setEditingCategoryId(null);
      setIsAddingCategory(false);
    }
  };

  const handleCategoryNameEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleCategoryNameSave = async (categoryId: string) => {
    if (!editingName.trim()) {
      setEditingCategoryId(null);
      return;
    }

    try {
      await updateCategoryName(categoryId, editingName.trim());
      await loadCategories();
      await loadMenus();
      setEditingCategoryId(null);
      setEditingName("");
      toast.success("Category updated");
    } catch (error) {
      toast.error("Failed to update category");
      console.error(error);
    }
  };

  const handleCategoryNameCancel = () => {
    setEditingCategoryId(null);
    setEditingName("");
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null);
      return;
    }

    const draggedIndex = categories.findIndex((c) => c.id === draggedCategoryId);
    const targetIndex = categories.findIndex((c) => c.id === targetCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategoryId(null);
      return;
    }

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    setCategories(newCategories);
    setDraggedCategoryId(null);

    try {
      await updateCategoryOrder(newCategories.map((c) => c.id));
      await loadMenus();
      toast.success("Category order updated");
    } catch (error) {
      toast.error("Failed to update category order");
      await loadCategories();
      await loadMenus();
      console.error(error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setIsAddingCategory(false);
      setNewCategoryName("");
      return;
    }

    try {
      await createCategory(newCategoryName.trim());
      await loadCategories();
      await loadMenus();
      setIsAddingCategory(false);
      setNewCategoryName("");
      toast.success("Category created");
    } catch (error) {
      toast.error("Failed to create category");
      console.error(error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await loadCategories();
      await loadMenus();
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    }
  };

  const filteredMenus = selectedTab === "all" ? menus : menus.filter((menu) => menu.categoryName === selectedTab);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Manage your menu items and categories</p>
        </div>
      </div>
      <div>
        <Tabs
          value={selectedTab === "__add__" || selectedTab === "__config__" ? "all" : selectedTab}
          onValueChange={(value) => {
            if (value !== "__add__" && value !== "__config__") {
              setSelectedTab(value);
            }
          }}
          className="mb-6"
        >
          <TabsList className="relative">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.name}
                className={isEditMode ? "relative group pl-6 pr-12" : ""}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, category.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id)}
              >
                {isEditMode && (
                  <HugeiconsIcon
                    icon={MoreVerticalCircle01Icon}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 cursor-move pointer-events-none"
                  />
                )}
                {isEditMode && editingCategoryId === category.id ? (
                  <Input
                    ref={inputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleCategoryNameSave(category.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCategoryNameSave(category.id);
                      } else if (e.key === "Escape") {
                        handleCategoryNameCancel();
                      }
                    }}
                    className="h-6 px-2 text-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className={isEditMode ? "cursor-move truncate block" : ""}
                    onDoubleClick={() => isEditMode && handleCategoryNameEdit(category)}
                  >
                    {category.name}
                  </span>
                )}
                {isEditMode && editingCategoryId !== category.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryNameEdit(category);
                      }}
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TabsTrigger>
            ))}
            {isEditMode && (
              <>
                {isAddingCategory ? (
                  <TabsTrigger value="__add__" className="relative" onClick={(e) => e.stopPropagation()}>
                    <Input
                      ref={inputRef}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onBlur={handleAddCategory}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCategory();
                        } else if (e.key === "Escape") {
                          setIsAddingCategory(false);
                          setNewCategoryName("");
                        }
                      }}
                      placeholder="Category name..."
                      className="h-6 px-2 text-sm w-32"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TabsTrigger>
                ) : (
                  <TabsTrigger
                    value="__add__"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingCategory(true);
                    }}
                    className="px-2"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                  </TabsTrigger>
                )}
              </>
            )}
            <TabsTrigger
              value="__config__"
              onClick={handleEditModeToggle}
              className={isEditMode ? "data-active:bg-primary data-active:text-primary-foreground" : ""}
            >
              <HugeiconsIcon icon={isEditMode ? Cancel01Icon : Settings01Icon} className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {!loading && (
            <Link
              href="/menu/create"
              className="w-full h-full flex flex-col gap-4 items-center justify-center border border-dashed border-border rounded-xl p-4 hover:bg-muted group"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="group-hover:rotate-180 transition-all ease-in-out" />
              <p className="text-sm text-muted-foreground transition-all ease-in-out">Add new menu item</p>
            </Link>
          )}
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="py-0">
                <CardContent className="p-2 flex flex-col gap-2">
                  <div className="shrink-0 relative aspect-4/3 rounded-xl overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="shrink-0 flex items-center justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredMenus.map((menu) => (
              <Card key={menu.id} className="py-0">
                <CardContent className="p-2 flex flex-col gap-2">
                  <div className="shrink-0 relative aspect-4/3 rounded-xl overflow-hidden">
                    <Image
                      src={menu.image || `https://placehold.co/600x400/png?text=Chattable`}
                      alt={menu.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="text-base font-semibold">{menu.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{menu.description || ""}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-between">
                    <p className="font-bold">${parseFloat(menu.price).toFixed(2)}</p>
                    <Link href={`/menu/${menu.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <HugeiconsIcon icon={PencilEdit02Icon} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
