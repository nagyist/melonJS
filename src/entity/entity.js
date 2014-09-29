/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 */

(function () {

    /**
     * me.ObjectSettings contains the object attributes defined in Tiled<br>
     * and is created by the engine and passed as parameter to the corresponding
     * object when loading a level<br>
     * the field marked Mandatory are to be defined either in Tiled, or in the
     * before calling the parent constructor<br>
     * <img src="images/object_properties.png"/><br>
     * @class
     * @protected
     * @memberOf me
     */
    me.ObjectSettings = {
        /**
         * object entity name<br>
         * as defined in the Tiled Object Properties
         * @public
         * @property {String} name
         * @memberOf me.ObjectSettings
         */
        name : null,

        /**
         * image ressource name to be loaded<br>
         * (in case of TiledObject, this field is automatically set)
         * @public
         * @property {String} image
         * @memberOf me.ObjectSettings
         */
        image : null,

        /**
         * specify a transparent color for the image in rgb format (#rrggbb)<br>
         * (using this option will imply processing time on the image)
         * @public
         * @deprecated Use PNG or GIF with transparency instead
         * @property {String=} transparent_color
         * @memberOf me.ObjectSettings
         */
        transparent_color : null,

        /**
         * width of a single sprite in the spritesheet<br>
         * (in case of TiledObject, this field is automatically set)
         * @public
         * @property {Number=} spritewidth
         * @memberOf me.ObjectSettings
         */
        spritewidth : null,

        /**
         * height of a single sprite in the spritesheet<br>
         * if not specified the value will be set to the corresponding image height<br>
         * (in case of TiledObject, this field is automatically set)
         * @public
         * @property {Number=} spriteheight
         * @memberOf me.ObjectSettings
         */
        spriteheight : null,

        /**
         * object type as defined in Tiled
         * @public
         * @property {String=} type
         * @memberOf me.ObjectSettings
         */
        type : null,
        
        /**
         * Mask collision detection for this object<br>
         * OPTIONAL
         * @public
         * @type Number
         * @name me.ObjectSettings#collisionMask
         */
        collisionMask : 0xFFFFFFFF
    };

    /*
     * A generic object entity
     */

    /**
     * a Generic Object Entity<br>
     * Object Properties (settings) are to be defined in Tiled, <br>
     * or when calling the parent constructor
     *
     * @class
     * @extends me.Renderable
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the entity object
     * @param {Number} y the y coordinates of the entity object
     * @param {me.ObjectSettings} settings Object Properties as defined in Tiled<br>
     * <img src="images/object_properties.png"/>
     */
    me.Entity = me.Renderable.extend(
    /** @scope me.Entity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
        
            /**
             * The entity renderable object (if defined)
             * @public
             * @type me.Renderable
             * @name renderable
             * @memberOf me.Entity
             */
            this.renderable = null;
            
            /**
             * The bounding rectangle for this entity
             * @protected
             * @type {me.Rect}
             * @name bounds
             * @memberOf me.Ellipse
             */
            this.bounds = undefined;

            // ensure mandatory properties are defined
            if ((typeof settings.width !== "number") || (typeof settings.height !== "number")) {
                throw new me.Entity.Error("height and width properties are mandatory when passing settings parameters to an object entity");
            }
            
            // call the super constructor
            this._super(me.Renderable, "init", [x, y,
                        settings.width,
                        settings.height]);

            if (settings.image) {
                var image = typeof settings.image === "object" ? settings.image : me.loader.getImage(settings.image);
                this.renderable = new me.AnimationSheet(0, 0, {
                    "image" : image,
                    "spritewidth" : ~~(settings.spritewidth || settings.width),
                    "spriteheight" : ~~(settings.spriteheight || settings.height),
                    "spacing" : ~~settings.spacing,
                    "margin" : ~~settings.margin
                });

                // check for user defined transparent color
                if (settings.transparent_color) {
                    this.renderable.setTransparency(settings.transparent_color);
                }
            }
           
            /**
             * Entity name<br>
             * as defined in the Tiled Object Properties
             * @public
             * @property String name
             * @memberOf me.Entity
             */
            this.name = settings.name ? settings.name.toLowerCase() : "";
            
            /**
             * object type (as defined in Tiled)
             * @public
             * @property String type
             * @memberOf me.Entity
             */
            this.type = settings.type;
            
            /**
             * dead/living state of the entity<br>
             * default value : true
             * @public
             * @type Boolean
             * @name alive
             * @memberOf me.Entity
             */
            this.alive = true;
        
            // just to keep track of when we flip
            this.lastflipX = false;
            this.lastflipY = false;
            
            /**
             * the entity body object
             * @public
             * @type me.Body
             * @name body
             * @memberOf me.Entity
             */
            // initialize the default body
            this.body = new me.Body(this);
            
            // add collision shape to the entity body if defined
            if (typeof (settings.getShape) === "function") {
                this.body.addShape(settings.getShape());
            }
            
            // ensure the entity bounds and pos are up-to-date
            this.updateBounds();
            
            // set the  collision mask if defined
            if (typeof(settings.collisionMask) !== "undefined") {
                this.body.setCollisionMask(settings.collisionMask);
            }
            
            // set the  collision mask if defined
            if (typeof(settings.collisionType) !== "undefined") {
                if (typeof me.collision.types[settings.collisionType] !== "undefined") {
                    this.body.collisionType = me.collision.types[settings.collisionType];
                } else {
                    throw new me.Entity.Error("Invalid value for the collisionType property");
                }
            }
        },

       /**
         * returns the bounding box for this entity, the smallest rectangle object completely containing this entity body shapes
         * @name getBounds
         * @memberOf me.Entity
         * @function
         * @return {me.Rect} this entity bounding box Rectangle object
         */
        getBounds : function () {
            return this.bounds;
        },
        
        /**
         * update the entity bounding rect (private)
         * when manually update the entity pos, you need to call this function
         * @protected
         * @name updateBounds
         * @memberOf me.Entity
         * @function
         */
        updateBounds : function () {
            if (!this.bounds) {
                this.bounds = new me.Rect(0, 0, 0, 0);
            }
            this.bounds.pos.setV(this.pos).add(this.body.pos);
            this.bounds.resize(this.body.width, this.body.height);
            return this.bounds;
        },
        
        /**
         * Flip object on horizontal axis
         * @name flipX
         * @memberOf me.Entity
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipX : function (flip) {
            if (flip !== this.lastflipX) {
                this.lastflipX = flip;
                if (this.renderable && this.renderable.flipX) {
                    // flip the animation
                    this.renderable.flipX(flip);
                }
                if (this.body) {
                    // flip the animation
                    this.body.flipX(flip);
                }
            }
        },

        /**
         * Flip object on vertical axis
         * @name flipY
         * @memberOf me.Entity
         * @function
         * @param {Boolean} flip enable/disable flip
         */
        flipY : function (flip) {
            if (flip !== this.lastflipY) {
                this.lastflipY = flip;
                if (this.renderable  && this.renderable.flipY) {
                    // flip the animation
                    this.renderable.flipY(flip);
                }
                if (this.body) {
                    // flip the animation
                    this.body.flipY(flip);
                }
            }
        },

        /**
         * return the distance to the specified entity
         * @name distanceTo
         * @memberOf me.Entity
         * @function
         * @param {me.Entity} entity Entity
         * @return {Number} distance
         */
        distanceTo: function (e) {
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var dx = (this.pos.x + this.hWidth)  - (e.pos.x + e.hWidth);
            var dy = (this.pos.y + this.hHeight) - (e.pos.y + e.hHeight);
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * return the distance to the specified point
         * @name distanceToPoint
         * @memberOf me.Entity
         * @function
         * @param {me.Vector2d} vector vector
         * @return {Number} distance
         */
        distanceToPoint: function (v) {
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var dx = (this.pos.x + this.hWidth)  - (v.x);
            var dy = (this.pos.y + this.hHeight) - (v.y);
            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * return the angle to the specified entity
         * @name angleTo
         * @memberOf me.Entity
         * @function
         * @param {me.Entity} entity Entity
         * @return {Number} angle in radians
         */
        angleTo: function (e) {
            var a = this.getBounds();
            var b = e.getBounds();
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var ax = (b.pos.x + b.hWidth) - (a.pos.x + a.hWidth);
            var ay = (b.pos.y + b.hHeight) - (a.pos.y + a.hHeight);
            return Math.atan2(ay, ax);
        },

        /**
         * return the angle to the specified point
         * @name angleToPoint
         * @memberOf me.Entity
         * @function
         * @param {me.Vector2d} vector vector
         * @return {Number} angle in radians
         */
        angleToPoint: function (v) {
            var a = this.getBounds();
            // the me.Vector2d object also implements the same function, but
            // we have to use here the center of both entities
            var ax = (v.x) - (a.pos.x + a.hWidth);
            var ay = (v.y) - (a.pos.y + a.hHeight);
            return Math.atan2(ay, ax);
        },

        /** @ignore */
        update : function (dt) {
            if (this.renderable) {
                return this.renderable.update(dt);
            }
            //if (this.body) {
                // Remove from here from now, as object are calling entity.body.update()
                // to be change later
            //    return this.body.update(dt);
            //}
            return false;
        },

        /**
         * object draw<br>
         * not to be called by the end user<br>
         * called by the game manager on each game loop
         * @name draw
         * @memberOf me.Entity
         * @function
         * @protected
         * @param {Context2d} context 2d Context on which draw our object
         **/
        draw : function (renderer) {
            // draw the sprite if defined
            if (this.renderable) {
                // translate the renderable position (relative to the entity)
                // and keeps it in the entity defined bounds
                var _bounds = this.getBounds();

                var x = ~~(_bounds.pos.x + (
                    this.anchorPoint.x * (_bounds.width - this.renderable.width)
                ));
                var y = ~~(_bounds.pos.y + (
                    this.anchorPoint.y * (_bounds.height - this.renderable.height)
                ));
                renderer.translate(x, y);
                this.renderable.draw(renderer);
                renderer.translate(-x, -y);
            }
        },

        /**
         * Destroy function<br>
         * @ignore
         */
        destroy : function () {
            // free some property objects
            if (this.renderable) {
                this.renderable.destroy.apply(this.renderable, arguments);
                this.renderable = null;
            }
            this.body.destroy.apply(this.body, arguments);
            this.body = null;
        },

        /**
         * OnDestroy Notification function<br>
         * Called by engine before deleting the object
         * @name onDestroyEvent
         * @memberOf me.Entity
         * @function
         */
        onDestroyEvent : function () {
            // to be extended !
        },

        /**
         * onCollision callback<br>
         * triggered in case of collision, when this entity body is being "touched" by another one<br>
         * @name onCollision
         * @memberOf me.Entity
         * @function
         * @param {me.collision.ResponseObject} response the collision response object
         * @param {me.Entity} other the other entity touching this one (reference to response.a)
         * @return false, if the collision response is to be ignored (for custom collision response)
         */
        onCollision : function () {
            return true;
        }
    });

    /*
     * A Collectable entity
     */

    /**
     * @class
     * @extends me.Entity
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the sprite object
     * @param {Number} y the y coordinates of the sprite object
     * @param {me.ObjectSettings} settings object settings
     */
    me.CollectableEntity = me.Entity.extend(
    /** @scope me.CollectableEntity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            // call the super constructor
            this._super(me.Entity, "init", [x, y, settings]);
            this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
            // collectable do not impact the other entity position when touched
            this.body.isSolid = false;
            this.body.isHeavy = false;
        }
    });

    /*
     * A level entity
     */

    /**
     * @class
     * @extends me.Entity
     * @memberOf me
     * @constructor
     * @param {Number} x the x coordinates of the object
     * @param {Number} y the y coordinates of the object
     * @param {me.ObjectSettings} settings object settings
     * @example
     * me.game.world.addChild(new me.LevelEntity(
     *     x, y, {
     *         "duration" : 250, // Fade duration (in ms)
     *         "color" : "#000", // Fade color
     *         "to" : "mymap2"   // TMX level to load
     *     }
     * ));
     */
    me.LevelEntity = me.Entity.extend(
    /** @scope me.LevelEntity.prototype */
    {
        /** @ignore */
        init : function (x, y, settings) {
            this._super(me.Entity, "init", [x, y, settings]);
            
            this.nextlevel = settings.to;

            this.fade = settings.fade;
            this.duration = settings.duration;
            this.fading = false;

            this.name = "levelEntity";

            // a temp variable
            this.gotolevel = settings.to;
            
            this.body.collisionType = me.collision.types.ACTION_OBJECT;
            
            // levelEntity are non visible object and therefore not solid
            this.body.isSolid = false;
            
        },

        /**
         * @ignore
         */
        onFadeComplete : function () {
            me.levelDirector.loadLevel(this.gotolevel);
            me.game.viewport.fadeOut(this.fade, this.duration);
        },

        /**
         * go to the specified level
         * @name goTo
         * @memberOf me.LevelEntity
         * @function
         * @param {String} [level=this.nextlevel] name of the level to load
         * @protected
         */
        goTo : function (level) {
            this.gotolevel = level || this.nextlevel;
            // load a level
            //console.log("going to : ", to);
            if (this.fade && this.duration) {
                if (!this.fading) {
                    this.fading = true;
                    me.game.viewport.fadeIn(this.fade, this.duration,
                            this.onFadeComplete.bind(this));
                }
            } else {
                me.levelDirector.loadLevel(this.gotolevel);
            }
        },

        /** @ignore */
        onCollision : function () {
            if (this.name === "levelEntity") {
                this.goTo();
            }
            return false;
        }
    });
    
    /**
     * Base class for Entity exception handling.
     * @name Error
     * @class
     * @memberOf me.Entity
     * @constructor
     * @param {String} msg Error message.
     */
    me.Entity.Error = me.Renderable.Error.extend({
        init : function (msg) {
            this._super(me.Renderable.Error, "init", [ msg ]);
            this.name = "me.Entity.Error";
        }
    });
})();
