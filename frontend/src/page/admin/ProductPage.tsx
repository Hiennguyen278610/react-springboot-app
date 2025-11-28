"use client";

import { createProductColumns } from "@/components/columns/product-col";
import { DataTable } from "@/components/data-table";
import { ProductAdd } from "@/components/dialogs/products/product-add";
import { ProductDelete } from "@/components/dialogs/products/product-delete";
import { ProductEdit } from "@/components/dialogs/products/product-edit";
import { ProductView } from "@/components/dialogs/products/product-view";
import CrudLayout from "@/layout/CrudLayout";
import type { ProductResponse } from "@/schema/product.schema";
import { productService } from "@/services/product.service";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ProductPage() {
    const [data, setData] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            const products = await productService.getAll();
            setData(products);
        } catch (error) {
            console.error("Lấy danh sách sản phẩm thất bại:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAdd = () => {
        setAddDialogOpen(true);
    };

    const handleProductAdded = () => {
        fetchProducts();
    };

    const handleEdit = (product: ProductResponse) => {
        setSelectedProduct(product);
        setEditDialogOpen(true);
    };

    const handleView = (product: ProductResponse) => {
        setSelectedProduct(product);
        setViewDialogOpen(true);
    };

    const handleDelete = (product: ProductResponse) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleProductUpdated = () => {
        fetchProducts();
        setSelectedProduct(null);
    };

    const handleProductDeleted = () => {
        fetchProducts();
        setSelectedProduct(null);
    };

    const columns = useMemo(
        () => createProductColumns({ onEdit: handleEdit, onView: handleView, onDelete: handleDelete }),
        []
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) {
        return (
            <CrudLayout title="Quản lý sản phẩm">
                <div className="container mx-auto py-10 flex justify-center">
                    <div className="text-lg">Đang tải dữ liệu...</div>
                </div>
            </CrudLayout>
        );
    }

    return (
        <CrudLayout title="Quản lý sản phẩm">
            <div className="h-full bg-background rounded-3xl shadow-lg">
                <DataTable
                    columns={columns}
                    data={data}
                    onAdd={handleAdd}
                    addButtonLabel="Thêm sản phẩm"
                />
            </div>

            <ProductAdd
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onProductAdded={handleProductAdded}
            />

            <ProductView
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                product={selectedProduct}
            />

            <ProductEdit
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                product={selectedProduct}
                onProductUpdated={handleProductUpdated}
            />

            <ProductDelete
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                product={selectedProduct}
                onProductDeleted={handleProductDeleted}
            />
        </CrudLayout>
    );
}