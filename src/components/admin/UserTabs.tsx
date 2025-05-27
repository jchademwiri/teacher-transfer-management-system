import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UsersList } from './UsersList'
import { UserForm } from './UserForm'
import { User } from '@/types'
import { UserFormValues } from './UserFormSchema'

interface UserTabsProps {
  users: User[]
  schools: any[]
  subjects: any[]
  searchQuery: string
  isLoading: boolean
  isEditing: boolean
  currentUser: User | null
  onSearchChange: (query: string) => void
  onEditUser: (user: User) => void
  onSubmit: (values: UserFormValues) => Promise<void>
  fetchUsers: () => void
}

export function UserTabs({
  users,
  schools,
  subjects,
  searchQuery,
  isLoading,
  isEditing,
  currentUser,
  onSearchChange,
  onEditUser,
  onSubmit,
  fetchUsers
}: UserTabsProps) {
  return (
    <Tabs defaultValue="list" className="w-full space-y-6">
      <div className="flex justify-center mb-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-[400px]">
          <TabsTrigger 
            value="list" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground flex-1"
          >
            Users List
          </TabsTrigger>
          <TabsTrigger 
            value="add"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground flex-1"
          >
            {isEditing ? 'Edit User' : 'Add User'}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="list">
        <Card className="bg-background p-6">          <UsersList
            users={users}
            searchQuery={searchQuery}
            isLoading={isLoading}
            onSearchChange={onSearchChange}
            onEditUser={onEditUser}
            fetchUsers={fetchUsers}
          />
        </Card>
      </TabsContent>

      <TabsContent value="add">
        <Card className="max-w-2xl mx-auto bg-background p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {isEditing ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isEditing 
                  ? 'Update the existing user\'s information below.' 
                  : 'Fill in the details below to create a new user account.'}
              </p>
            </div>
            <div className="border-t pt-6">
              <UserForm
                isEditing={isEditing}
                currentUser={currentUser}
                schools={schools}
                subjects={subjects}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
