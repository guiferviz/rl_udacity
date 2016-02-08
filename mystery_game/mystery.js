/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Guiferviz
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/*
 * MysteryGame class.
 *
 * Creates a game similar to the one showed in the Reinforcement Learning
 * MOOC (Udacity) by Georgia Tech.
 * The games appears in "Lesson 2 - Reinforcement Learning Basics".
 *
 * Container: DOM element where the game will be inyected. The game will
 *          adapt to the container size.
 * Map: bidimensional array with numbers from 0 to 5.
 *          0 - Wall
 *          1 - Empty cell
 *          2,3,4,5 - Red, Green, Blue, Yellow cell
 * Player: Array with the x and y origin coordinates of the player.
 * Obj: Array with the x and y circle position.
 * Actions: Array with the actions in the order you want.
 *          The first element corresponds with the key number 1 and so on.
 *          ["up", "down", "left", "right", "catch", "release"]
 *          If not array is given random actions will be choosen.
 */
MysteryGame = function (container, map, player, circle, actions)
{
    this.w = container.offsetWidth;
    this.h = container.offsetHeight;
    if (!this.h)
    {
        this.h = this.w;
        container.style.height = this.h + "px";
    }
    this.tiles_x = map[0].length;
    this.tiles_y = map.length;
    this.size_x = this.w / this.tiles_x;
    this.size_y = this.h / this.tiles_y;
    this.endColor = Math.floor(Math.random() * 4 + 2);
    this.svg = this.createSvg(this.w, this.h);
    this.catched = false;
    this.actions = actions || ["up", "down", "left", "right",
    		"catch", "release"];
    if (!actions)
        this.shuffle(this.actions);

    this.map = this.createMap(map);
    this.player = this.createPlayer(player);
    this.obj = this.createObject(circle);
    this.goodtext = this.createText(this.w / 2, this.h / 2, "+1");
    this.goodtext.classList.add("hide");
    this.badtext = this.createText(this.w / 2, this.h / 2, "-1");
    this.badtext.classList.add("hide");
    this.badtext.classList.add("bad");

    container.innerHTML = "";  // Deletes all in container
    container.appendChild(this.svg);

    var this_ = this;
    window.addEventListener("keypress", function(e)
    {
        this_.doAction(e.charCode);
    });
};

MysteryGame.SVG_URL = "http://www.w3.org/2000/svg";

MysteryGame.prototype.shuffle = function (o)
{
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

MysteryGame.prototype.createSvg = function (w, h)
{
    var svg = document.createElementNS(MysteryGame.SVG_URL, "svg");
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.classList.add("mystery");

    return svg;
};

MysteryGame.prototype.createRect = function (x, y, w, h)
{
    var rect = document.createElementNS(MysteryGame.SVG_URL, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);

    return rect;
};

MysteryGame.prototype.createCircle = function (x, y, r)
{
    var circle = document.createElementNS(MysteryGame.SVG_URL, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);

    return circle;
};

MysteryGame.prototype.createMap = function (colors)
{
    var map = [];
    for (var i = 0; i < this.tiles_y; ++i)
    {
    	var row = [];
        for (var j = 0; j < this.tiles_x; ++j)
        {
            var rect = this.createRect(j * this.size_x, i * this.size_y,
                this.size_x, this.size_y);
            rect.classList.add("c" + colors[i][j]);
            rect.color = colors[i][j];
            row.push(rect);
            this.svg.appendChild(rect);
        }
        map.push(row);
    }

    return map;
};

MysteryGame.prototype.createText = function (x, y, txt)
{
    var text = document.createElementNS(MysteryGame.SVG_URL, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.innerHTML = txt;
    this.svg.appendChild(text);

    return text;
};

MysteryGame.prototype.createPlayer = function (origin)
{
    var player = this.createRect(origin[0] * this.size_x + this.size_x * 0.2,
        origin[1] * this.size_y + this.size_y * 0.2,
        this.size_x * 0.6, this.size_y * 0.6);
    player.classList.add("c" + this.endColor);
    player.wx = origin[0];
    player.wy = origin[1];
    this.svg.appendChild(player);

    return player;
};

MysteryGame.prototype.createObject = function (origin)
{
    var obj = this.createCircle(origin[0] * this.size_x + this.size_x * 0.5,
        origin[1] * this.size_y + this.size_y * 0.5,
        this.size_x * 0.3);
    obj.classList.add("c" + this.endColor);
    obj.wx = origin[0];
    obj.wy = origin[1];
    this.svg.appendChild(obj);

    return obj;
};

MysteryGame.prototype.showText = function (domText)
{
    domText.classList.remove("hide");
    setTimeout(function () { domText.classList.add("hide"); }, 1500);
};

MysteryGame.prototype.doAction = function (charCode)
{
    var action = charCode - '1'.charCodeAt(0);
	if (action >= 0 && action <= 5)
	{
		var actionName = this.actions[action];
		var dx = 0, dy = 0;
		if (actionName == "up")
		{
			dy = -1;
		}
		else if (actionName == "down")
		{
			dy = 1;
		}
		else if (actionName == "left")
		{
			dx = -1;
		}
		else if (actionName == "right")
		{
			dx = 1;
		}
		else if (actionName == "catch")
		{
			if (this.player.wx == this.obj.wx &&
				this.player.wy == this.obj.wy)
			{
                this.showText(this.goodtext);
				this.catched = true;
			}
		}
		else if (actionName == "release")
		{
			if (this.catched)
			{
				this.catched = false;
				if (this.map[this.obj.wy][this.obj.wx].color == this.endColor)
				{
					this.createText(this.w / 2, this.h / 2, "You Win :)");
				}
                else
                {
                    this.showText(this.badtext);
                }
			}
		}

		// If not a wall.
		if (this.player.wy + dy >= 0 && this.player.wx + dx < this.tiles_x &&
			this.player.wx + dx >= 0 && this.player.wy + dy < this.tiles_y &&
			this.map[this.player.wy + dy][this.player.wx + dx].color > 0)
		{
            // Move player.
			this.player.wx += dx;
			this.player.wy += dy;
			this.player.setAttribute('x',
                    this.player.wx * this.size_x + this.size_x * 0.2);
			this.player.setAttribute('y',
                    this.player.wy * this.size_y + this.size_y * 0.2);
			
            // Move circle if catched.
			if (this.catched)
			{
				this.obj.wx += dx;
				this.obj.wy += dy;
				this.obj.setAttribute('cx',
                        this.obj.wx * this.size_x + this.size_x * 0.5);
				this.obj.setAttribute('cy',
                        this.obj.wy * this.size_y + this.size_y * 0.5);

                if (this.map[this.obj.wy][this.obj.wx].color == this.endColor
                    && !this.firstTimeIn)
                {
                    this.firstTimeIn = true;
                    this.showText(this.goodtext);
                }
			}
		}
	}
};
