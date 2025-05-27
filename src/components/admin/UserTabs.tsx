import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  onSubmit
}: UserTabsProps) {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Users List</TabsTrigger>
        <TabsTrigger value="add">Add User</TabsTrigger>
      </TabsList>
      <TabsContent value="list" className="border rounded-lg p-4">
        <UsersList
          users={users}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onSearchChange={onSearchChange}
          onEditUser={onEditUser}
        />
      </TabsContent>
      <TabsContent value="add" className="border rounded-lg p-4">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update the user information below.' : 'Add a new user to the system.'}
          </p>
          <UserForm
            isEditing={isEditing}
            currentUser={currentUser}
            schools={schools}
            subjects={subjects}
            onSubmit={onSubmit}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
