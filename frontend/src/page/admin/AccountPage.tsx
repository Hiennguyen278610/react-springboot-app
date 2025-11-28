"use client";

import { createUserColumns } from "@/components/columns/account-col";
import { DataTable } from "@/components/data-table";
import { AccountAdd } from "@/components/dialogs/accounts/account-add";
import { AccountDelete } from "@/components/dialogs/accounts/account-delete";
import { AccountEdit } from "@/components/dialogs/accounts/account-edit";
import { AccountView } from "@/components/dialogs/accounts/account-view";
import CrudLayout from "@/layout/CrudLayout";
import type { UserResponse } from "@/schema/user.schema";
import { userService } from "@/services/user.service";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const [data, setData] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const { currentUser } = useAuth();

    const fetchUsers = useCallback(async () => {
        try {
            const users = await userService.getAll();
            setData(users);
        } catch (error) {
            console.error("Lấy danh sách thất bại:", error);
        } finally { setLoading(false); }
    }, []);

    const handleAdd = () => { setAddDialogOpen(true); }

    const handleUserAdded = () => { fetchUsers(); }

    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    }

    const handleView = (user: UserResponse) => {
        setSelectedUser(user);
        setViewDialogOpen(true);
    }

    const handleDelete = (user: UserResponse) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    }

    const handleUserDeleted = () => {
        fetchUsers();
        setSelectedUser(null);
    }

    // Tạo columns với handlers
    const columns = useMemo(() => createUserColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }), [])
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (loading) {
        return (
            <CrudLayout title="Quản lý tài khoản">
                <div className="container mx-auto py-10 flex justify-center">
                    <div className="text-lg">Đang tải dữ liệu...</div>
                </div>
            </CrudLayout>
        );
    }

    return (
        <CrudLayout title="Quản lý tài khoản">
            <div className="h-full bg-background rounded-3xl shadow-lg">
                <DataTable
                    columns={columns}
                    data={data}
                    onAdd={handleAdd}
                    addButtonLabel="Tạo tài khoản"
                />
            </div>

            <AccountAdd open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onUserAdded={handleUserAdded}
            />

            <AccountView open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                user={selectedUser}
            />

            <AccountEdit open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                user={selectedUser}
            />

            <AccountDelete open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onUserDeleted={handleUserDeleted}
                user={selectedUser}
                currentUser={currentUser}
            />
        </CrudLayout>
    );
}