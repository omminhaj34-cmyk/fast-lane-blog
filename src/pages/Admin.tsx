import { useState } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, X, Save } from "lucide-react";
import { useArticles, Article, categories } from "@/data/articles";
import { useQueryClient } from "@tanstack/react-query";

const ADMIN_PASSWORD = "wt-20260308";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("adminAuth") === "true");
    const [passwordInput, setPasswordInput] = useState("");
    const [loginError, setLoginError] = useState("");

    const { data: posts = [] } = useArticles();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Article | null>(null);
    const [formData, setFormData] = useState<Partial<Article>>({});
    const [isLoading, setIsLoading] = useState(false);

    const openModal = (post?: Article) => {
        if (post) {
            setEditingPost(post);
            setFormData({ ...post });
        } else {
            setEditingPost(null);
            setFormData({
                id: Date.now().toString(),
                title: "",
                slug: "",
                excerpt: "",
                content: "",
                author: "Admin",
                date: new Date().toISOString().split("T")[0],
                category: categories[0],
                image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
                readTime: "5 min read"
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await fetch(`http://localhost:3000/api/posts/${id}`, { method: 'DELETE' });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let processedData = { ...formData } as Article;
        if (!processedData.slug && processedData.title) {
            processedData.slug = processedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        if (editingPost) {
            await fetch(`http://localhost:3000/api/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData)
            });
        } else {
            await fetch(`http://localhost:3000/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData)
            });
        }

        queryClient.invalidateQueries({ queryKey: ['articles'] });
        setIsLoading(false);
        closeModal();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            localStorage.setItem("adminAuth", "true");
            setIsAuthenticated(true);
            setLoginError("");
            setPasswordInput("");
        } else {
            setLoginError("Incorrect password");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminAuth");
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <Layout>
                <section className="container py-12 md:py-20 animate-fade-in flex items-center justify-center min-h-[50vh]">
                    <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-sm text-center">
                        <h1 className="font-display text-2xl font-bold mb-6">Admin Login</h1>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="Enter admin password"
                                />
                            </div>
                            {loginError && <p className="text-sm text-destructive text-left">{loginError}</p>}
                            <button
                                type="submit"
                                className="w-full py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </section>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="container py-12 md:py-20 animate-fade-in relative">
                <div className="max-w-5xl mx-auto">
                    <nav className="text-sm text-muted-foreground mb-8">
                        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground font-medium">Admin</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span>Create Post</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
                            <p className="text-muted-foreground text-sm mt-1">View, edit, or delete existing articles.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border text-sm text-muted-foreground">
                                        <th className="p-4 font-medium">Title</th>
                                        <th className="p-4 font-medium hidden md:table-cell">Category</th>
                                        <th className="p-4 font-medium hidden sm:table-cell">Date</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((article) => (
                                        <tr key={article.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="p-4">
                                                <p className="font-medium text-foreground line-clamp-1">{article.title}</p>
                                                <p className="text-sm text-muted-foreground mt-0.5 md:hidden">{article.category}</p>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-sm">
                                                <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-sm text-muted-foreground">
                                                {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(article)}
                                                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                                                        aria-label="Edit post"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article.id)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                        aria-label="Delete post"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {posts.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No blog posts found. Create your first post!
                            </div>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-lg flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-border">
                                <h2 className="text-xl font-bold">{editingPost ? "Edit Post" : "Create New Post"}</h2>
                                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <input
                                        name="title"
                                        value={formData.title || ""}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug (URL)</label>
                                    <input
                                        name="slug"
                                        value={formData.slug || ""}
                                        onChange={handleChange}
                                        placeholder="Auto-generated if left empty"
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category || ""}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Publish Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date || ""}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Excerpt (Meta Description)</label>
                                    <textarea
                                        name="excerpt"
                                        value={formData.excerpt || ""}
                                        onChange={handleChange}
                                        required
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content (HTML allowed)</label>
                                    <textarea
                                        name="content"
                                        value={formData.content || ""}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                                    />
                                </div>
                            </form>

                            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-input bg-background hover:bg-muted text-foreground font-medium rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isLoading ? "Saving..." : "Save Post"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </Layout>
    );
};

export default Admin;
