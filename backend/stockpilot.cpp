#include <iostream>
#include <fstream>
#include <string>
using namespace std;

class Product
{
public:
    int id;
    string name;
    double costPrice;
    double sellPrice;
    int quantity;
    Product* next;

    Product(int i, string n, double c, double s, int q)
    {
        id = i;
        name = n;
        costPrice = c;
        sellPrice = s;
        quantity = q;
        next = NULL;
    }
};

class StockPilot
{
private:
    Product* head;

    class TreeNode
    {
    public:
        Product* product;
        TreeNode* left;
        TreeNode* right;

        TreeNode(Product* p)
        {
            product = p;
            left = right = NULL;
        }
    };

    TreeNode* root;

    TreeNode* insertTree(TreeNode* node, Product* p)
    {
        if (node == NULL)
            return new TreeNode(p);

        if (p->id < node->product->id)
            node->left = insertTree(node->left, p);
        else if (p->id > node->product->id)
            node->right = insertTree(node->right, p);

        return node;
    }

    Product* searchTree(TreeNode* node, int id)
    {
        if (node == NULL)
            return NULL;

        if (id == node->product->id)
            return node->product;

        if (id < node->product->id)
            return searchTree(node->left, id);

        return searchTree(node->right, id);
    }

    void deleteTree(TreeNode* node)
    {
        if (node == NULL)
            return;
        deleteTree(node->left);
        deleteTree(node->right);
        delete node;
    }

public:
    StockPilot()
    {
        head = NULL;
        root = NULL;
    }

    ~StockPilot()
    {
        Product* curr = head;
        while (curr != NULL)
        {
            Product* tmp = curr;
            curr = curr->next;
            delete tmp;
        }
        deleteTree(root);
    }

    Product* findProduct(int id)
    {
        Product* curr = head;
        while (curr != NULL)
        {
            if (curr->id == id)
                return curr;
            curr = curr->next;
        }
        return NULL;
    }

    bool addProduct(int id, string name, double cost, double sell, int qty)
    {
        if (id <= 0 || cost < 0 || sell < 0 || qty < 0 || findProduct(id) != NULL)
            return false;

        Product* p = new Product(id, name, cost, sell, qty);
        p->next = head;
        head = p;
        root = insertTree(root, p);
        return true;
    }

    Product* searchByID(int id)
    {
        return searchTree(root, id);
    }

    void displayProducts()
    {
        if (head == NULL)
        {
            cout << "No products available.\n";
            return;
        }

        cout << "\nID\tName\t\tCost\tSell\tQty\n";
        Product* curr = head;
        while (curr != NULL)
        {
            cout << curr->id << "\t" << curr->name << "\t\t"
                 << curr->costPrice << "\t" << curr->sellPrice
                 << "\t" << curr->quantity << "\n";
            curr = curr->next;
        }
    }

    void sortByPrice()
    {
        if (head == NULL)
            return;

        for (Product* i = head; i != NULL; i = i->next)
        {
            for (Product* j = head; j->next != NULL; j = j->next)
            {
                if (j->sellPrice > j->next->sellPrice)
                {
                    int tID = j->id;
                    string tName = j->name;
                    double tCost = j->costPrice;
                    double tSell = j->sellPrice;
                    int tQty = j->quantity;

                    j->id = j->next->id;
                    j->name = j->next->name;
                    j->costPrice = j->next->costPrice;
                    j->sellPrice = j->next->sellPrice;
                    j->quantity = j->next->quantity;

                    j->next->id = tID;
                    j->next->name = tName;
                    j->next->costPrice = tCost;
                    j->next->sellPrice = tSell;
                    j->next->quantity = tQty;
                }
            }
        }

        deleteTree(root);
        root = NULL;
        for (Product* curr = head; curr != NULL; curr = curr->next)
            root = insertTree(root, curr);

        cout << "Products sorted by selling price (low to high).\n";
    }

    void saveProducts()
    {
        ofstream file("products.txt");
        Product* curr = head;
        while (curr != NULL)
        {
            file << curr->id << "\n"
                 << curr->name << "\n"
                 << curr->costPrice << "\n"
                 << curr->sellPrice << "\n"
                 << curr->quantity << "\n";
            curr = curr->next;
        }
    }

    void loadProducts()
    {
        ifstream file("products.txt");
        if (!file)
            return;

        int id, qty;
        double cost, sell;
        string name;

        while (file >> id)
        {
            file.ignore(1000, '\n');
            getline(file, name);
            file >> cost >> sell >> qty;
            file.ignore(1000, '\n');
            addProduct(id, name, cost, sell, qty);
        }
    }

    Product* firstProduct()
    {
        return head;
    }
};

class Transaction
{
public:
    string type;
    int productID;
    string description;
    double amount;
    Transaction* next;

    Transaction(string t, int id, string d, double a)
    {
        type = t;
        productID = id;
        description = d;
        amount = a;
        next = NULL;
    }
};

class FinTracker
{
private:
    Transaction* head;

public:
    double revenue;
    double expenses;
    double costOfGoods;

    FinTracker()
    {
        head = NULL;
        revenue = 0;
        expenses = 0;
        costOfGoods = 0;
    }

    ~FinTracker()
    {
        Transaction* curr = head;
        while (curr != NULL)
        {
            Transaction* tmp = curr;
            curr = curr->next;
            delete tmp;
        }
    }

    void addTransaction(string type, int id, string desc, double amount)
    {
        Transaction* t = new Transaction(type, id, desc, amount);
        t->next = head;
        head = t;
    }

    void recordSale(int id, string name, double saleAmount, double costAmount)
    {
        revenue += saleAmount;
        costOfGoods += costAmount;
        addTransaction("SALE", id, name, saleAmount);
    }

    void addExpense(string description, double amount)
    {
        expenses += amount;
        addTransaction("EXPENSE", 0, description, amount);
    }

    void displayTransactions()
    {
        if (head == NULL)
        {
            cout << "No transactions yet.\n";
            return;
        }

        cout << "\nType\tAmount\tDescription\n";
        for (Transaction* curr = head; curr != NULL; curr = curr->next)
        {
            cout << curr->type << "\t" << curr->amount << "\t"
                 << curr->description << "\n";
        }
    }

    void sortTransactionsByAmount()
    {
        for (Transaction* i = head; i != NULL; i = i->next)
        {
            for (Transaction* j = head; j != NULL && j->next != NULL; j = j->next)
            {
                if (j->amount > j->next->amount)
                {
                    string tType = j->type;
                    int tID = j->productID;
                    string tDesc = j->description;
                    double tAmount = j->amount;

                    j->type = j->next->type;
                    j->productID = j->next->productID;
                    j->description = j->next->description;
                    j->amount = j->next->amount;

                    j->next->type = tType;
                    j->next->productID = tID;
                    j->next->description = tDesc;
                    j->next->amount = tAmount;
                }
            }
        }
        cout << "Transactions sorted by amount (low to high).\n";
    }

    void report()
    {
        cout << "\n------ FINANCIAL REPORT ------\n";
        cout << "Revenue:         PKR " << revenue << "\n";
        cout << "Cost of goods:   PKR " << costOfGoods << "\n";
        cout << "Other expenses:  PKR " << expenses << "\n";
        cout << "Gross profit:    PKR " << revenue - costOfGoods << "\n";
        cout << "Net profit:      PKR " << revenue - costOfGoods - expenses << "\n";
    }

    void saveTransactions()
    {
        ofstream file("transactions.txt");
        file << revenue << "\n" << expenses << "\n" << costOfGoods << "\n";
        for (Transaction* curr = head; curr != NULL; curr = curr->next)
        {
            file << curr->type << "\n"
                 << curr->productID << "\n"
                 << curr->description << "\n"
                 << curr->amount << "\n";
        }
    }

    void loadTransactions()
    {
        ifstream file("transactions.txt");
        if (!file)
            return;

        file >> revenue >> expenses >> costOfGoods;
        file.ignore(1000, '\n');

        string type, desc;
        int id;
        double amount;

        while (getline(file, type))
        {
            if (!(file >> id))
                break;
            file.ignore(1000, '\n');
            getline(file, desc);
            if (!(file >> amount))
                break;
            file.ignore(1000, '\n');
            addTransaction(type, id, desc, amount);
        }
    }
};

class UndoRecord
{
public:
    int productID;
    int oldQuantity;
    UndoRecord* next;

    UndoRecord(int id, int qty)
    {
        productID = id;
        oldQuantity = qty;
        next = NULL;
    }
};

class UndoStack
{
private:
    UndoRecord* top;

public:
    UndoStack()
    {
        top = NULL;
    }

    ~UndoStack()
    {
        while (top != NULL)
        {
            UndoRecord* tmp = top;
            top = top->next;
            delete tmp;
        }
    }

    void push(int id, int oldQty)
    {
        UndoRecord* record = new UndoRecord(id, oldQty);
        record->next = top;
        top = record;
    }

    bool pop(int &id, int &oldQty)
    {
        if (top == NULL)
            return false;

        UndoRecord* tmp = top;
        id = tmp->productID;
        oldQty = tmp->oldQuantity;
        top = top->next;
        delete tmp;
        return true;
    }
};

class Order
{
public:
    int productID;
    int quantity;
    Order* next;

    Order(int id, int qty)
    {
        productID = id;
        quantity = qty;
        next = NULL;
    }
};

class OrderQueue
{
private:
    Order* front;
    Order* rear;

public:
    OrderQueue()
    {
        front = rear = NULL;
    }

    ~OrderQueue()
    {
        while (front != NULL)
        {
            Order* tmp = front;
            front = front->next;
            delete tmp;
        }
    }

    void enqueue(int id, int qty)
    {
        Order* order = new Order(id, qty);
        if (rear == NULL)
            front = rear = order;
        else
        {
            rear->next = order;
            rear = order;
        }
        cout << "Order added to queue.\n";
    }

    bool dequeue(int &id, int &qty)
    {
        if (front == NULL)
            return false;

        Order* tmp = front;
        id = tmp->productID;
        qty = tmp->quantity;
        front = front->next;

        if (front == NULL)
            rear = NULL;

        delete tmp;
        return true;
    }
};

int main()
{
    StockPilot stock;
    FinTracker finance;
    UndoStack undo;
    OrderQueue orders;

    stock.loadProducts();
    finance.loadTransactions();

    int choice;

    do
    {
        cout << "\n========== STOCKPILOT + FINTRACKER ==========\n";
        cout << "1. Add product\n";
        cout << "2. Display products\n";
        cout << "3. Search product by ID (BST)\n";
        cout << "4. Sort products by selling price\n";
        cout << "5. Sell product\n";
        cout << "6. Add other expense\n";
        cout << "7. Display transactions\n";
        cout << "8. Sort transactions by amount\n";
        cout << "9. Financial report\n";
        cout << "10. Undo last stock change\n";
        cout << "11. Add pending order\n";
        cout << "12. Process next order\n";
        cout << "0. Save and exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1)
        {
            int id, qty;
            string name;
            double cost, sell;

            cout << "Product ID: ";
            cin >> id;
            cout << "Product name (one word): ";
            cin >> name;
            cout << "Cost price: ";
            cin >> cost;
            cout << "Selling price: ";
            cin >> sell;
            cout << "Quantity: ";
            cin >> qty;

            if (stock.addProduct(id, name, cost, sell, qty))
                cout << "Product added.\n";
            else
                cout << "Invalid details or ID already exists.\n";
        }
        else if (choice == 2)
        {
            stock.displayProducts();
        }
        else if (choice == 3)
        {
            int id;
            cout << "Enter product ID: ";
            cin >> id;
            Product* p = stock.searchByID(id);

            if (p != NULL)
                cout << "Found: " << p->name << ", Qty: " << p->quantity
                     << ", Selling price: PKR " << p->sellPrice << "\n";
            else
                cout << "Product not found.\n";
        }
        else if (choice == 4)
        {
            stock.sortByPrice();
            stock.displayProducts();
        }
        else if (choice == 5)
        {
            int id, qty;
            cout << "Product ID to sell: ";
            cin >> id;
            cout << "Quantity to sell: ";
            cin >> qty;

            Product* p = stock.findProduct(id);
            if (p == NULL || qty <= 0 || p->quantity < qty)
            {
                cout << "Product not found or insufficient stock.\n";
            }
            else
            {
                undo.push(id, p->quantity);
                p->quantity -= qty;

                double saleAmount = p->sellPrice * qty;
                double costAmount = p->costPrice * qty;
                finance.recordSale(id, p->name, saleAmount, costAmount);

                cout << "Sale recorded. Revenue: PKR " << saleAmount << "\n";
            }
        }
        else if (choice == 6)
        {
            string desc;
            double amount;
            cout << "Expense description (one word): ";
            cin >> desc;
            cout << "Expense amount: ";
            cin >> amount;

            if (amount > 0)
            {
                finance.addExpense(desc, amount);
                cout << "Expense recorded.\n";
            }
            else
                cout << "Amount must be positive.\n";
        }
        else if (choice == 7)
        {
            finance.displayTransactions();
        }
        else if (choice == 8)
        {
            finance.sortTransactionsByAmount();
            finance.displayTransactions();
        }
        else if (choice == 9)
        {
            finance.report();
        }
        else if (choice == 10)
        {
            int id, oldQty;
            if (undo.pop(id, oldQty))
            {
                Product* p = stock.findProduct(id);
                if (p != NULL)
                {
                    p->quantity = oldQty;
                    cout << "Stock quantity restored.\n";
                }
            }
            else
                cout << "Nothing to undo.\n";
        }
        else if (choice == 11)
        {
            int id, qty;
            cout << "Product ID: ";
            cin >> id;
            cout << "Quantity requested: ";
            cin >> qty;

            if (stock.findProduct(id) != NULL && qty > 0)
                orders.enqueue(id, qty);
            else
                cout << "Invalid product ID or quantity.\n";
        }
        else if (choice == 12)
        {
            int id, qty;
            if (orders.dequeue(id, qty))
            {
                Product* p = stock.findProduct(id);
                if (p != NULL && p->quantity >= qty)
                {
                    undo.push(id, p->quantity);
                    p->quantity -= qty;
                    cout << "Order processed for " << p->name
                         << ". Remaining stock: " << p->quantity << "\n";
                }
                else
                    cout << "Order cannot be fulfilled; insufficient stock.\n";
            }
            else
                cout << "No pending orders.\n";
        }
        else if (choice != 0)
        {
            cout << "Invalid choice.\n";
        }

    } while (choice != 0);

    stock.saveProducts();
    finance.saveTransactions();
    cout << "Data saved. Goodbye!\n";

    return 0;
}
