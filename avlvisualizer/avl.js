function buttonState(status)
{
    document.getElementById('insert_button').disabled = status;
    document.getElementById('delete_button').disabled = status;
    document.getElementById('find_button').disabled = status;
}

async function read_input(element_id)
{
    var temp = document.getElementById(element_id);
    temp = temp.value;
    const nodeArr = temp.split(",");

    if (nodeArr[0] == "") return;

    if (element_id == 'insert_input')
    {
        document.getElementById('found').innerHTML = "";
        buttonState(true);
        for (var i = 0; i < nodeArr.length; i++)
        {
            await newTree.insertion(parseInt(nodeArr[i]));
        }
        buttonState(false);
    }
    else if (element_id == 'delete_input')
    {
        document.getElementById('found').innerHTML = "";
        buttonState(true);
        for (var i = 0; i < nodeArr.length; i++)
        {
            await newTree.deletion(parseInt(nodeArr[i]));
        }
        buttonState(false);
    }
    else if (element_id == 'find_input')
    {
        buttonState(true);
        for (var i = 0; i < nodeArr.length; i++)
        {
            await newTree.find(parseInt(nodeArr[i]));
        }
        buttonState(false);
    }
}

class treeNode
{
    constructor(value)
    {
        this.value = value;
        this.parent = null;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 40;
        this.y = 40;
        this.radius = 50;
        this.newX = 40;
        this.newY = 40;
    }
    updateHeight()
    {
        let leftHeight = 0, rightHeight = 0;
        if (this.left)
        {
            leftHeight = this.left.height;
        }
        if (this.right)
        {
            rightHeight = this.right.height;
        }
        this.height = (leftHeight > rightHeight) ? (leftHeight + 1) : (rightHeight + 1);
    }
}

class avlTree
{
    constructor()
    {
        this.root = null;
        this.arr = [];
        this.moveSpeed = 5;
        this.showSpeed = 1000;
        this.waitSpeed = 750;
        this.animationMultiplier = 0.5;
        this.constX = 750;
        this.constY = 100;
        this.timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
        this.step = 10;
        this.path = [];
    }

    newPosition(node, x, y)
    {
        if (node == null) return x;
        x = this.newPosition(node.left, x, y + 1);
        node.newX = x;
        node.newY = y;

        x++;
        x = this.newPosition(node.right, x, y + 1);
        return x;
    }

    relativePositionUpdate(node)
    {
        if (node == null) return;
        this.relativePositionUpdate(node.left);

        if (node != this.root)
        {
            node.newX = (node.newX - this.root.newX) * 2 * node.radius + this.constX;
            node.newY = node.newY * 100;
        }

        this.arr.push(node);
        this.relativePositionUpdate(node.right);
    }

    async move()
    {
        let canvas = document.getElementById('board');
        let ctx = canvas.getContext('2d');

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let stopAnimation = true;

        for (let node of this.arr)
        {

            let slope = 1;

            let xshift = this.step + (-2 * this.step) * (node.x - node.newX > 0), yshift = 0;
            if (node.x == node.newX) xshift = 0;
            if (xshift == 0)
            {
                if (Math.abs(node.y - node.newY) < 1) yshift = 0;
                else yshift = this.step + (-2 * this.step) * (node.y - node.newY > 0);
            }
            else
            {
                slope = (node.newY - node.y) / (node.newX - node.x);
                yshift = xshift * slope;
            }

            node.x += xshift;
            node.y += yshift;

            if (node.x != node.newX || node.y != node.newY)
                stopAnimation = false;

            if (Math.abs(node.x - node.newX) < this.step && Math.abs(node.y - node.newY) < this.step)
            {
                node.x = node.newX;
                node.y = node.newY;
            }


            this.drawInsert(node);
        }



        if (stopAnimation)
        {
            this.arr = [];

        }
        else
        {
            await this.timeout(this.moveSpeed);
            await this.move();
        }

    }

    async callMove()
    {
        if (this.root == null) return;
        this.newPosition(this.root, 0, 1);
        this.relativePositionUpdate(this.root);
        this.root.newX = this.constX;
        this.root.newY = this.constY;
        await this.move();
    }

    async showPath(status, rotate = [], up = false)
    {
        let canvas = document.getElementById('board');
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = (up) ? "blue" : "yellow";
        ctx.lineWidth = 5;
        let node;
        if (rotate.length == 0)
          {
            for (var i = 0; i < this.path.length - 1; i++)
            {
                node = this.path[i];
                if (node == null) continue;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
                ctx.stroke();
                await this.timeout(this.animationMultiplier * this.showSpeed);
            }
            node = this.path[this.path.length - 1];
            if (node)
            {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
                ctx.stroke();
            }
            await this.timeout(this.animationMultiplier * this.showSpeed);
            if (status != null)
                ctx.strokeStyle = "green";

            if (node)
            {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
                ctx.stroke();
                await this.timeout(this.animationMultiplier * this.showSpeed);
            }
        }

        if (rotate.length)
        {
            ctx.strokeStyle = "red";
            node = rotate[0];
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.strokeStyle = "pink";
            node = rotate[1];
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.strokeStyle = "cyan";
            node = rotate[2];
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + 3, 0, 2 * Math.PI);
            ctx.stroke();

        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        this.path = [];
    }

    async rotatell(parent, child, grandChild)
    {
        if (parent.parent)
        {
            if (parent.parent.left == parent) parent.parent.left = child;
            else parent.parent.right = child;
        }
        else this.root = child;
        parent.left = child.right;
        if (child.right) child.right.parent = parent;
        child.right = parent;
        child.parent = parent.parent;
        parent.parent = child;
        parent.updateHeight();
        child.updateHeight();
        grandChild.updateHeight();
        await this.showPath(parent, [parent, child, grandChild]);
        await this.timeout(this.animationMultiplier * this.showSpeed);
    }
    async rotaterr(parent, child, grandChild)
    {
        if (parent.parent)
        {
            if (parent.parent.left == parent) parent.parent.left = child;
            else parent.parent.right = child;
        }
        else this.root = child;
        parent.right = child.left;
        if (child.left) child.left.parent = parent;
        child.left = parent;
        child.parent = parent.parent;
        parent.parent = child;
        parent.updateHeight();
        child.updateHeight();
        grandChild.updateHeight();
        await this.showPath(parent, [parent, child, grandChild]);
        await this.timeout(this.animationMultiplier * this.showSpeed);
    }
    async rotatelr(parent, child, grandChild)
    {
        parent.left = grandChild;
        child.right = grandChild.left;
        if (grandChild.left) grandChild.left.parent = child;
        grandChild.left = child;
        grandChild.parent = parent;
        child.parent = grandChild;

        parent.updateHeight();
        child.updateHeight();
        grandChild.updateHeight();

        await this.showPath(parent, [parent, child, grandChild]);
        await this.timeout(this.animationMultiplier * this.showSpeed);

        await this.callMove();

        await this.rotatell(parent, grandChild, child);
    }
    async rotaterl(parent, child, grandChild)
    {
        parent.right = grandChild;
        child.left = grandChild.right;
        if (grandChild.right) grandChild.right.parent = child;
        grandChild.right = child;
        grandChild.parent = parent;
        child.parent = grandChild;

        parent.updateHeight();
        child.updateHeight();
        grandChild.updateHeight();

        await this.showPath(parent, [parent, child, grandChild]);
        await this.timeout(this.animationMultiplier * this.showSpeed);

        await this.callMove();

        await this.rotaterr(parent, grandChild, child);
    }
    async levelorder(root)
    {
        this.arr.push(root);
        document.getElementById('lvl').innerHTML = "Level Order : ";
        while (this.arr.length > 0)
        {
            let temp = this.arr.shift();

            if (temp.parent && temp.parent.left == temp)
                document.getElementById('lvl').innerHTML += temp.parent.value + 'L';
            else if (temp.parent && temp.parent.right == temp)
                document.getElementById('lvl').innerHTML += temp.parent.value + 'R';
            document.getElementById('lvl').innerHTML += temp.value + " ";
            if (temp.left) { this.arr.push(temp.left); }
            if (temp.right) { this.arr.push(temp.right); }
        }
    }
    async inorder(node)
    {
        if (node == null) return;
        this.inorder(node.left);
        if (node.parent && node.parent.left == node)
            document.getElementById('in').innerHTML += node.parent.value + 'L';
        else if (node.parent && node.parent.right == node)
            document.getElementById('in').innerHTML += node.parent.value + 'R';
        document.getElementById('in').innerHTML += node.value + " ";
        this.inorder(node.right);
    }

    async insertion(value)
    {

        const newNode = new treeNode(value);
          //for first case
        if (this.root == null)
        {
            this.root = newNode;

            this.levelorder(this.root);
            document.getElementById('in').innerHTML = "Inorder: ";
            this.inorder(this.root);

            this.drawInsert(this.root);

            await this.callMove();

            return;
        }

        ///////////////////////////////////////
        await this.callMove();
        ///////////////////////////////////////

        let temp = this.root;
        while (1)
        {
            this.path.push(temp);
            if (temp.value > value)
            {
                if (temp.left)
                {
                    temp = temp.left;
                }
                else
                {
                    temp.left = newNode;
                    newNode.parent = temp;
                    break;
                }
            }
            else
            {
                if (temp.right)
                {
                    temp = temp.right;
                }
                else
                {
                    temp.right = newNode;
                    newNode.parent = temp;
                    break;
                }
            }
        }
        // this.path.push(newNode);

        await this.showPath(this.root);
        await this.timeout(this.animationMultiplier * this.waitSpeed);



        await this.callMove();
        await this.timeout(this.animationMultiplier * this.waitSpeed);

        let child = newNode, grandChild = null;

        let rotate = 1;

        while (temp)
        {
            if (rotate) this.path.push(temp);
            temp.updateHeight();
            if (temp.height > 2)
            {
                let leftHeight = 0, rightHeight = 0;
                if (temp.left)
                {
                    leftHeight = temp.left.height;
                }
                if (temp.right)
                {
                    rightHeight = temp.right.height;
                }
                if (leftHeight - rightHeight > 1) // ll or lr
                {
                    rotate = 0;
                    await this.showPath(temp, [], true);

                    if (child.left === grandChild) // ll
                    {
                        await this.rotatell(temp, child, grandChild);
                        temp.updateHeight();
                        child.updateHeight();
                        temp = child;
                    }
                    else if (child.right === grandChild) //lr
                    {
                        await this.rotatelr(temp, child, grandChild);
                        temp.updateHeight();
                        child.updateHeight();
                        grandChild.updateHeight();
                        temp = grandChild;
                    }
                }
                else if (rightHeight - leftHeight > 1) // rr or rl
                {
                    rotate = 0;
                    await this.showPath(temp, [], true);

                    if (child.left === grandChild) //rl
                    {
                        await this.rotaterl(temp, child, grandChild);
                        temp.updateHeight();
                        child.updateHeight();
                        temp = child;
                    }
                    else if (child.right === grandChild)//rr
                    {
                        await this.rotaterr(temp, child, grandChild);
                        temp.updateHeight();
                        child.updateHeight();
                        grandChild.updateHeight();
                        temp = grandChild;
                    }
                }
            }
            grandChild = child;
            child = temp;
            temp = temp.parent;
        }

        await this.showPath(null, [], true);
        await this.timeout(this.animationMultiplier * this.waitSpeed);

        this.path = [];

        ///////////////////////////////////////
        await this.callMove();
        ///////////////////////////////////////

        if (this.root)
        {
            this.levelorder(this.root);
            document.getElementById('in').innerHTML = "Inorder: ";
            this.inorder(this.root);

            await this.callMove();
        }
    }
    
    async find(value)
    {
        ///////////////////////////////////////
        await this.callMove();
        ///////////////////////////////////////
    
        if (this.root == null)
        {
            document.getElementById('found').innerHTML = "Couldn't find " + value;
            return null;
        }
        let temp = this.root;
        while (temp)
        {
            this.path.push(temp);
            if (temp.value < value) temp = temp.right;
            else if (temp.value > value) temp = temp.left;
            else
            {
                await this.showPath(temp);
                document.getElementById('found').innerHTML = "Found " + value;
                return temp;
            }
        }
        await this.showPath(temp);
        document.getElementById('found').innerHTML = "Couldn't find " + value;
        return null;
    }
    
    async deletion(value)
    {
        ///////////////////////////////////////
        await this.callMove();
        ///////////////////////////////////////
    
        let node = await this.find(value);
        await this.timeout(this.animationMultiplier * this.waitSpeed);
    
        if (node == null)
        {
            await this.callMove();
            return;
        }
    
        let parent = node.parent;
        if (node.left && node.right)
        {
            let temp = node.right;
            this.path.push(temp);
            if (!temp.left)
            {
                temp.parent.right = temp.right;
                if (temp.right) temp.right.parent = temp.parent;
                parent = temp.parent;
                temp.parent = null;
                node.value = temp.value;
                temp.right = null;
            }
            else
            {
                while (temp.left)
                {
                    this.path.push(temp.left);
                    temp = temp.left;
                }
                parent = temp.parent;
                temp.parent.left = temp.right;
                if (temp.right) temp.right.parent = temp.parent;
                node.value = temp.value;
                temp.parent = null;
                temp.right = null;
            }
        }
        else
        {
            let temp = node.left;
            if (temp == null) temp = node.right;
            if (temp != null) this.path.push(temp);
            if (node == this.root) this.root = temp;
            else if (node.parent.left == node) node.parent.left = temp;
            else node.parent.right = temp;
            if (temp) temp.parent = node.parent;
            node.parent = null;
            node.left = null;
            node.right = null;
        }
    
        await this.showPath(this.root);
        await this.timeout(this.animationMultiplier * this.waitSpeed);
    
        await this.callMove();
    
        while (parent)
        {
            this.path.push(parent);
            parent.updateHeight();
            let leftHeight = 0, rightHeight = 0;
            if (parent.left) leftHeight = parent.left.height;
            if (parent.right) rightHeight = parent.right.height;
            if (leftHeight - rightHeight > 1)
            {
                await this.showPath(parent, [], true);
                await this.timeout(this.animationMultiplier * this.waitSpeed);
                let child = parent.left;
                let lh = 0, rh = 0;
                if (child.left) lh = child.left.height;
                if (child.right) rh = child.right.height;
                if (lh >= rh) { await this.rotatell(parent, child, child.left); await this.callMove(); }
                else { await this.rotatelr(parent, child, child.right); await this.callMove(); }
            }
            else if (rightHeight - leftHeight > 1)
            {
                await this.showPath(parent, [], true);
                await this.timeout(this.animationMultiplier * this.waitSpeed);
                let child = parent.right;
                let lh = 0, rh = 0;
                if (child.left) lh = child.left.height;
                if (child.right) rh = child.right.height;
                if (rh >= lh) { await this.rotaterr(parent, child, child.right); await this.callMove(); }
                else { await this.rotaterl(parent, child, child.left); await this.callMove(); }
            }
    
            parent = parent.parent;
    
        }
    
        await this.showPath(null, [], true);
        await this.timeout(this.animationMultiplier * this.waitSpeed);
    
        await this.callMove();
    
        if (this.root)
        {
            this.levelorder(this.root);
            document.getElementById('in').innerHTML = "Inorder: ";
            this.inorder(this.root);
    
            await this.callMove();
        }
    }

    canvas_arrow(context, node)
    {
        context.save();
        var headlen = 10; // length of head in pixels
        context.translate(node.parent.x, node.parent.y);
        var dx = node.x - node.parent.x;
        var dy = node.y - node.parent.y;
        var angle = Math.atan2(dy, dx);
        context.rotate(angle);
        var distance = Math.sqrt((dx * dx) + (dy * dy));
        context.moveTo(node.radius, 0);
        context.lineTo(distance - node.radius, 0);
        context.translate(distance - node.radius, 0);
        context.rotate(Math.PI / 6);
        context.lineTo(-headlen, 0);
        context.moveTo(0, 0);
        context.rotate(-Math.PI / 3);
        context.lineTo(-headlen, 0);
        context.restore();
        return;
    }

    async drawInsert(node)
    {
        let canvas = document.getElementById('board');
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        // if (node.parent) this.canvas_arrow(ctx,(3*node.parent.x+node.x)/4,(3*node.parent.y+node.y)/4,(node.parent.x+3*node.x)/4,(node.parent.y+3*node.y)/4);
        if (node.parent) this.canvas_arrow(ctx, node);
        ctx.stroke();
        ctx.font = '35px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.value, node.x, node.y);
    }
}

// put highlight vala in deletion

var newTree = new avlTree();
