import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Users, Crown, User } from "lucide-react";

interface UserWithRole {
  user_id: string;
  username: string;
  display_name: string | null;
  role: AppRole;
}

const roleIcons = {
  admin: Crown,
  moderator: Shield,
  user: User,
};

const roleColors = {
  admin: "bg-destructive text-destructive-foreground",
  moderator: "bg-primary text-primary-foreground",
  user: "bg-secondary text-secondary-foreground",
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          username: profile.username,
          display_name: profile.display_name,
          role: (userRole?.role as AppRole) || "user",
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    if (userId === user?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode alterar sua própria role.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(userId);

      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );

      toast({
        title: "Role atualizada",
        description: `Usuário atualizado para ${newRole}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a role.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Gerenciar Usuários
            </h1>
            <p className="text-muted-foreground">
              Administre roles e permissões dos usuários
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {users.filter((u) => u.role === "moderator").length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Moderadores</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary-foreground" />
                <span className="text-2xl font-bold">
                  {users.filter((u) => u.role === "user").length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Usuários</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Todos os Usuários ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u) => {
                const RoleIcon = roleIcons[u.role];
                const isCurrentUser = u.user_id === user?.id;

                return (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(u.display_name || u.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {u.display_name || u.username}
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (você)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{u.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCurrentUser ? (
                        <Badge className={roleColors[u.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {u.role}
                        </Badge>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(value) =>
                            updateUserRole(u.user_id, value as AppRole)
                          }
                          disabled={updating === u.user_id}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-4 w-4" />
                                {u.role}
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                user
                              </div>
                            </SelectItem>
                            <SelectItem value="moderator">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                moderator
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}

              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
