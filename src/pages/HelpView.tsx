function HelpView() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use</h2>
        <div className="prose dark:prose-invert max-w-none">
          <h3>Getting Started</h3>
          <p>
            Welcome to Weekly Shop! This app helps you manage your grocery shopping efficiently.
            Here's how to use each feature:
          </p>
          
          <h4>List View</h4>
          <ul>
            <li>Search for items to add to your shopping list</li>
            <li>Create new items if they don't exist</li>
            <li>Organize items by store section</li>
          </ul>
          
          <h4>Shopping View</h4>
          <ul>
            <li>Items are sorted by store layout</li>
            <li>Check off items as you shop</li>
            <li>Mark items as unavailable</li>
          </ul>
          
          <h4>Admin View</h4>
          <ul>
            <li>Manage product database</li>
            <li>Update store sections</li>
            <li>Adjust item locations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HelpView;