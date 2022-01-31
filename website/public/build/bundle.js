
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const fontLoaded = writable(false);

    /**
     * From SMUI
     * https://github.com/hperrin/svelte-material-ui/blob/273ded17c978ece3dd87f32a58dd9839e5c61325/components/forwardEvents.js
     */


    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    const sozaiPalleteColors = new Set([
      'primary', 'secondary', 'error', 'success', 'alert'
    ]);

    // uses array spread to foil eslint formatting into vertical line
    const materialPalleteColors = new Set([
      ...['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue'],
      ...['cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber'],
      ...['orange', 'deep-orange', 'brown'],
    ]);

    /** @type {(color: string) => string} */
    const getColor = color => {
      if (sozaiPalleteColors.has(color)) {
        return `var(--${color}-color)`;
      }
      if (materialPalleteColors.has(color)) {
        return `var(--${color})`;
      }
      return color;
    };

    /* node_modules/sozai/src/components/TextField/Label.svelte generated by Svelte v3.46.3 */
    const file$4 = "node_modules/sozai/src/components/TextField/Label.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let label;
    	let label_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "outlined-cover svelte-1exh1wp");
    			toggle_class(div0, "cover", /*outlined*/ ctx[3] && /*labelOnTop*/ ctx[5]);
    			toggle_class(div0, "loaded", /*loaded*/ ctx[7]);
    			add_location(div0, file$4, 26, 2, 735);
    			attr_dev(label, "class", "svelte-1exh1wp");
    			add_render_callback(() => /*label_elementresize_handler*/ ctx[15].call(label));
    			toggle_class(label, "dense", /*dense*/ ctx[0]);
    			toggle_class(label, "error", /*error*/ ctx[2]);
    			toggle_class(label, "filled", /*filled*/ ctx[4]);
    			toggle_class(label, "outlined", /*outlined*/ ctx[3]);
    			toggle_class(label, "top", /*labelOnTop*/ ctx[5]);
    			toggle_class(label, "focused", /*focused*/ ctx[1]);
    			add_location(label, file$4, 28, 2, 821);
    			attr_dev(div1, "class", "s-label");
    			attr_dev(div1, "style", /*style*/ ctx[8]);
    			add_location(div1, file$4, 25, 0, 703);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			label_resize_listener = add_resize_listener(label, /*label_elementresize_handler*/ ctx[15].bind(label));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*outlined, labelOnTop*/ 40) {
    				toggle_class(div0, "cover", /*outlined*/ ctx[3] && /*labelOnTop*/ ctx[5]);
    			}

    			if (dirty & /*loaded*/ 128) {
    				toggle_class(div0, "loaded", /*loaded*/ ctx[7]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8192)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[13],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[13])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[13], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*dense*/ 1) {
    				toggle_class(label, "dense", /*dense*/ ctx[0]);
    			}

    			if (dirty & /*error*/ 4) {
    				toggle_class(label, "error", /*error*/ ctx[2]);
    			}

    			if (dirty & /*filled*/ 16) {
    				toggle_class(label, "filled", /*filled*/ ctx[4]);
    			}

    			if (dirty & /*outlined*/ 8) {
    				toggle_class(label, "outlined", /*outlined*/ ctx[3]);
    			}

    			if (dirty & /*labelOnTop*/ 32) {
    				toggle_class(label, "top", /*labelOnTop*/ ctx[5]);
    			}

    			if (dirty & /*focused*/ 2) {
    				toggle_class(label, "focused", /*focused*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 256) {
    				attr_dev(div1, "style", /*style*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			label_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let style;
    	let $fontLoaded;
    	validate_store(fontLoaded, 'fontLoaded');
    	component_subscribe($$self, fontLoaded, $$value => $$invalidate(12, $fontLoaded = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Label', slots, ['default']);
    	let { dense = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { outlined = false } = $$props;
    	let { filled = false } = $$props;
    	let { labelOnTop = false } = $$props;
    	let { prepend = false } = $$props;
    	let { color = 'primary' } = $$props;
    	let { bgColor = 'var(--app-bg-color)' } = $$props;
    	let labelWidth = 0;
    	let loaded = false;

    	const writable_props = [
    		'dense',
    		'focused',
    		'error',
    		'outlined',
    		'filled',
    		'labelOnTop',
    		'prepend',
    		'color',
    		'bgColor'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	function label_elementresize_handler() {
    		labelWidth = this.clientWidth;
    		$$invalidate(6, labelWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('dense' in $$props) $$invalidate(0, dense = $$props.dense);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(4, filled = $$props.filled);
    		if ('labelOnTop' in $$props) $$invalidate(5, labelOnTop = $$props.labelOnTop);
    		if ('prepend' in $$props) $$invalidate(9, prepend = $$props.prepend);
    		if ('color' in $$props) $$invalidate(10, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(11, bgColor = $$props.bgColor);
    		if ('$$scope' in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		fontLoaded,
    		getColor,
    		dense,
    		focused,
    		error,
    		outlined,
    		filled,
    		labelOnTop,
    		prepend,
    		color,
    		bgColor,
    		labelWidth,
    		loaded,
    		style,
    		$fontLoaded
    	});

    	$$self.$inject_state = $$props => {
    		if ('dense' in $$props) $$invalidate(0, dense = $$props.dense);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(4, filled = $$props.filled);
    		if ('labelOnTop' in $$props) $$invalidate(5, labelOnTop = $$props.labelOnTop);
    		if ('prepend' in $$props) $$invalidate(9, prepend = $$props.prepend);
    		if ('color' in $$props) $$invalidate(10, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(11, bgColor = $$props.bgColor);
    		if ('labelWidth' in $$props) $$invalidate(6, labelWidth = $$props.labelWidth);
    		if ('loaded' in $$props) $$invalidate(7, loaded = $$props.loaded);
    		if ('style' in $$props) $$invalidate(8, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*labelWidth, $fontLoaded*/ 4160) {
    			if (labelWidth > 0 && $fontLoaded) {
    				tick().then(() => $$invalidate(7, loaded = true));
    			}
    		}

    		if ($$self.$$.dirty & /*color, bgColor, labelWidth*/ 3136) {
    			$$invalidate(8, style = `--color: ${getColor(color)}; --bg-color: ${bgColor}; --label-width: ${labelWidth}px;`);
    		}
    	};

    	return [
    		dense,
    		focused,
    		error,
    		outlined,
    		filled,
    		labelOnTop,
    		labelWidth,
    		loaded,
    		style,
    		prepend,
    		color,
    		bgColor,
    		$fontLoaded,
    		$$scope,
    		slots,
    		label_elementresize_handler
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			dense: 0,
    			focused: 1,
    			error: 2,
    			outlined: 3,
    			filled: 4,
    			labelOnTop: 5,
    			prepend: 9,
    			color: 10,
    			bgColor: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get dense() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelOnTop() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelOnTop(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules/sozai/src/components/TextField/Hint.svelte generated by Svelte v3.46.3 */
    const file$3 = "node_modules/sozai/src/components/TextField/Hint.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*hint*/ ctx[1]);
    			t1 = space();
    			t2 = text(/*error*/ ctx[0]);
    			attr_dev(div, "class", "s-hint svelte-43pkj1");
    			toggle_class(div, "beeg", /*beeg*/ ctx[2]);
    			toggle_class(div, "error", Boolean(/*error*/ ctx[0]));
    			toggle_class(div, "hint", Boolean(/*hint*/ ctx[1]));
    			add_location(div, file$3, 12, 0, 288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*hint*/ 2) set_data_dev(t0, /*hint*/ ctx[1]);
    			if (!current || dirty & /*error*/ 1) set_data_dev(t2, /*error*/ ctx[0]);

    			if (dirty & /*beeg*/ 4) {
    				toggle_class(div, "beeg", /*beeg*/ ctx[2]);
    			}

    			if (dirty & /*Boolean, error*/ 1) {
    				toggle_class(div, "error", Boolean(/*error*/ ctx[0]));
    			}

    			if (dirty & /*Boolean, hint*/ 2) {
    				toggle_class(div, "hint", Boolean(/*hint*/ ctx[1]));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[3], true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, /*transitionProps*/ ctx[3], false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hint', slots, []);
    	let { error = '' } = $$props;
    	let { hint = '' } = $$props;
    	let { beeg = false } = $$props;
    	let { transitionProps = { y: -10, duration: 100, easing: quadOut } } = $$props;
    	const writable_props = ['error', 'hint', 'beeg', 'transitionProps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    		if ('hint' in $$props) $$invalidate(1, hint = $$props.hint);
    		if ('beeg' in $$props) $$invalidate(2, beeg = $$props.beeg);
    		if ('transitionProps' in $$props) $$invalidate(3, transitionProps = $$props.transitionProps);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		quadOut,
    		error,
    		hint,
    		beeg,
    		transitionProps
    	});

    	$$self.$inject_state = $$props => {
    		if ('error' in $$props) $$invalidate(0, error = $$props.error);
    		if ('hint' in $$props) $$invalidate(1, hint = $$props.hint);
    		if ('beeg' in $$props) $$invalidate(2, beeg = $$props.beeg);
    		if ('transitionProps' in $$props) $$invalidate(3, transitionProps = $$props.transitionProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [error, hint, beeg, transitionProps];
    }

    class Hint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, not_equal, {
    			error: 0,
    			hint: 1,
    			beeg: 2,
    			transitionProps: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hint",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get error() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beeg() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beeg(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Hint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Hint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/TextField/Underline.svelte generated by Svelte v3.46.3 */
    const file$2 = "node_modules/sozai/src/components/TextField/Underline.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "line svelte-tzqse8");
    			toggle_class(div0, "focused", /*focused*/ ctx[2]);
    			toggle_class(div0, "error", /*error*/ ctx[3]);
    			add_location(div0, file$2, 13, 2, 347);
    			attr_dev(div1, "class", "line-container svelte-tzqse8");
    			attr_dev(div1, "style", /*style*/ ctx[4]);
    			toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			add_location(div1, file$2, 12, 0, 269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*focused*/ 4) {
    				toggle_class(div0, "focused", /*focused*/ ctx[2]);
    			}

    			if (dirty & /*error*/ 8) {
    				toggle_class(div0, "error", /*error*/ ctx[3]);
    			}

    			if (dirty & /*style*/ 16) {
    				attr_dev(div1, "style", /*style*/ ctx[4]);
    			}

    			if (dirty & /*noUnderline, outlined*/ 3) {
    				toggle_class(div1, "hidden", /*noUnderline*/ ctx[0] || /*outlined*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Underline', slots, []);
    	let { noUnderline = false } = $$props;
    	let { outlined = false } = $$props;
    	let { focused = false } = $$props;
    	let { error = false } = $$props;
    	let { color = 'primary' } = $$props;
    	const writable_props = ['noUnderline', 'outlined', 'focused', 'error', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Underline> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('noUnderline' in $$props) $$invalidate(0, noUnderline = $$props.noUnderline);
    		if ('outlined' in $$props) $$invalidate(1, outlined = $$props.outlined);
    		if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(3, error = $$props.error);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		getColor,
    		noUnderline,
    		outlined,
    		focused,
    		error,
    		color,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('noUnderline' in $$props) $$invalidate(0, noUnderline = $$props.noUnderline);
    		if ('outlined' in $$props) $$invalidate(1, outlined = $$props.outlined);
    		if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
    		if ('error' in $$props) $$invalidate(3, error = $$props.error);
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 32) {
    			$$invalidate(4, style = `--color: ${getColor(color)}`);
    		}
    	};

    	return [noUnderline, outlined, focused, error, style, color];
    }

    class Underline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			noUnderline: 0,
    			outlined: 1,
    			focused: 2,
    			error: 3,
    			color: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Underline",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get noUnderline() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Underline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Underline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/sozai/src/components/TextField/TextField.svelte generated by Svelte v3.46.3 */
    const file$1 = "node_modules/sozai/src/components/TextField/TextField.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (50:2) {#if label}
    function create_if_block_3(ctx) {
    	let current;
    	const label_slot_template = /*#slots*/ ctx[26].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[29], get_label_slot_context);
    	const label_slot_or_fallback = label_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (label_slot_or_fallback) label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (label_slot_or_fallback) {
    				label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[29], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			} else {
    				if (label_slot_or_fallback && label_slot_or_fallback.p && (!current || dirty & /*labelOnTop, dense, focused, error, outlined, filled, prepend, color, bgColor, label*/ 1183194)) {
    					label_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (label_slot_or_fallback) label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(50:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (52:6) <Label         {labelOnTop}         {dense}         {focused}         {error}         {outlined}         {filled}         {prepend}         {color}         {bgColor}       >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 16) set_data_dev(t, /*label*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(52:6) <Label         {labelOnTop}         {dense}         {focused}         {error}         {outlined}         {filled}         {prepend}         {color}         {bgColor}       >",
    		ctx
    	});

    	return block;
    }

    // (51:23)        
    function fallback_block(ctx) {
    	let label_1;
    	let current;

    	label_1 = new Label({
    			props: {
    				labelOnTop: /*labelOnTop*/ ctx[20],
    				dense: /*dense*/ ctx[8],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[10],
    				outlined: /*outlined*/ ctx[6],
    				filled: /*filled*/ ctx[7],
    				prepend: /*prepend*/ ctx[11],
    				color: /*color*/ ctx[3],
    				bgColor: /*bgColor*/ ctx[17],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_1_changes = {};
    			if (dirty & /*labelOnTop*/ 1048576) label_1_changes.labelOnTop = /*labelOnTop*/ ctx[20];
    			if (dirty & /*dense*/ 256) label_1_changes.dense = /*dense*/ ctx[8];
    			if (dirty & /*focused*/ 2) label_1_changes.focused = /*focused*/ ctx[1];
    			if (dirty & /*error*/ 1024) label_1_changes.error = /*error*/ ctx[10];
    			if (dirty & /*outlined*/ 64) label_1_changes.outlined = /*outlined*/ ctx[6];
    			if (dirty & /*filled*/ 128) label_1_changes.filled = /*filled*/ ctx[7];
    			if (dirty & /*prepend*/ 2048) label_1_changes.prepend = /*prepend*/ ctx[11];
    			if (dirty & /*color*/ 8) label_1_changes.color = /*color*/ ctx[3];
    			if (dirty & /*bgColor*/ 131072) label_1_changes.bgColor = /*bgColor*/ ctx[17];

    			if (dirty & /*$$scope, label*/ 536870928) {
    				label_1_changes.$$scope = { dirty, ctx };
    			}

    			label_1.$set(label_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(51:23)        ",
    		ctx
    	});

    	return block;
    }

    // (83:32) 
    function create_if_block_2(ctx) {
    	let textarea_1;
    	let textarea_1_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea_1 = element("textarea");
    			attr_dev(textarea_1, "rows", /*rows*/ ctx[13]);
    			attr_dev(textarea_1, "aria-label", /*label*/ ctx[4]);
    			attr_dev(textarea_1, "class", "s-input textarea svelte-xwhp9l");
    			textarea_1.disabled = /*disabled*/ ctx[18];
    			attr_dev(textarea_1, "placeholder", textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[5] : '');
    			toggle_class(textarea_1, "dense", /*dense*/ ctx[8]);
    			toggle_class(textarea_1, "filled", /*filled*/ ctx[7]);
    			toggle_class(textarea_1, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(textarea_1, "error", /*error*/ ctx[10]);
    			add_location(textarea_1, file$1, 83, 4, 2146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea_1, anchor);
    			set_input_value(textarea_1, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea_1, "input", /*textarea_1_input_handler*/ ctx[28]),
    					listen_dev(textarea_1, "focus", /*toggleFocus*/ ctx[22], false, false, false),
    					listen_dev(textarea_1, "blur", /*toggleFocus*/ ctx[22], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[23].call(null, textarea_1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows*/ 8192) {
    				attr_dev(textarea_1, "rows", /*rows*/ ctx[13]);
    			}

    			if (dirty & /*label*/ 16) {
    				attr_dev(textarea_1, "aria-label", /*label*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 262144) {
    				prop_dev(textarea_1, "disabled", /*disabled*/ ctx[18]);
    			}

    			if (dirty & /*value, placeholder*/ 33 && textarea_1_placeholder_value !== (textarea_1_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[5] : '')) {
    				attr_dev(textarea_1, "placeholder", textarea_1_placeholder_value);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea_1, /*value*/ ctx[0]);
    			}

    			if (dirty & /*dense*/ 256) {
    				toggle_class(textarea_1, "dense", /*dense*/ ctx[8]);
    			}

    			if (dirty & /*filled*/ 128) {
    				toggle_class(textarea_1, "filled", /*filled*/ ctx[7]);
    			}

    			if (dirty & /*outlined*/ 64) {
    				toggle_class(textarea_1, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty & /*error*/ 1024) {
    				toggle_class(textarea_1, "error", /*error*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(83:32) ",
    		ctx
    	});

    	return block;
    }

    // (68:2) {#if (!textarea && !select) || autocomplete}
    function create_if_block_1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "aria-label", /*label*/ ctx[4]);
    			attr_dev(input, "class", "s-input svelte-xwhp9l");
    			input.disabled = /*disabled*/ ctx[18];
    			attr_dev(input, "placeholder", input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[5] : '');
    			toggle_class(input, "dense", /*dense*/ ctx[8]);
    			toggle_class(input, "filled", /*filled*/ ctx[7]);
    			toggle_class(input, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(input, "error", /*error*/ ctx[10]);
    			add_location(input, file$1, 68, 4, 1811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[27]),
    					listen_dev(input, "focus", /*toggleFocus*/ ctx[22], false, false, false),
    					listen_dev(input, "blur", /*toggleFocus*/ ctx[22], false, false, false),
    					action_destroyer(/*forwardEvents*/ ctx[23].call(null, input))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 16) {
    				attr_dev(input, "aria-label", /*label*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 262144) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[18]);
    			}

    			if (dirty & /*value, placeholder*/ 33 && input_placeholder_value !== (input_placeholder_value = !/*value*/ ctx[0] ? /*placeholder*/ ctx[5] : '')) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*dense*/ 256) {
    				toggle_class(input, "dense", /*dense*/ ctx[8]);
    			}

    			if (dirty & /*filled*/ 128) {
    				toggle_class(input, "filled", /*filled*/ ctx[7]);
    			}

    			if (dirty & /*outlined*/ 64) {
    				toggle_class(input, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty & /*error*/ 1024) {
    				toggle_class(input, "error", /*error*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(68:2) {#if (!textarea && !select) || autocomplete}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#if showHint}
    function create_if_block(ctx) {
    	let hint_1;
    	let current;

    	hint_1 = new Hint({
    			props: {
    				error: /*error*/ ctx[10],
    				hint: /*hint*/ ctx[9],
    				beeg: /*outlined*/ ctx[6] || /*filled*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hint_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hint_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hint_1_changes = {};
    			if (dirty & /*error*/ 1024) hint_1_changes.error = /*error*/ ctx[10];
    			if (dirty & /*hint*/ 512) hint_1_changes.hint = /*hint*/ ctx[9];
    			if (dirty & /*outlined, filled*/ 192) hint_1_changes.beeg = /*outlined*/ ctx[6] || /*filled*/ ctx[7];
    			hint_1.$set(hint_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hint_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hint_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hint_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(109:2) {#if showHint}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let underline;
    	let t2;
    	let div_class_value;
    	let current;
    	let if_block0 = /*label*/ ctx[4] && create_if_block_3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*textarea*/ ctx[12] && !/*select*/ ctx[14] || /*autocomplete*/ ctx[15]) return create_if_block_1;
    		if (/*textarea*/ ctx[12] && !/*select*/ ctx[14]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type && current_block_type(ctx);

    	underline = new Underline({
    			props: {
    				noUnderline: /*noUnderline*/ ctx[16],
    				outlined: /*outlined*/ ctx[6],
    				focused: /*focused*/ ctx[1],
    				error: /*error*/ ctx[10],
    				color: /*color*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let if_block2 = /*showHint*/ ctx[21] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(underline.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", div_class_value = "s-component s-input-container " + /*klass*/ ctx[19] + " svelte-xwhp9l");
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$1, 48, 0, 1430);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			mount_component(underline, div, null);
    			append_dev(div, t2);
    			if (if_block2) if_block2.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*label*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			}

    			const underline_changes = {};
    			if (dirty & /*noUnderline*/ 65536) underline_changes.noUnderline = /*noUnderline*/ ctx[16];
    			if (dirty & /*outlined*/ 64) underline_changes.outlined = /*outlined*/ ctx[6];
    			if (dirty & /*focused*/ 2) underline_changes.focused = /*focused*/ ctx[1];
    			if (dirty & /*error*/ 1024) underline_changes.error = /*error*/ ctx[10];
    			if (dirty & /*color*/ 8) underline_changes.color = /*color*/ ctx[3];
    			underline.$set(underline_changes);

    			if (/*showHint*/ ctx[21]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*showHint*/ 2097152) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass*/ 524288 && div_class_value !== (div_class_value = "s-component s-input-container " + /*klass*/ ctx[19] + " svelte-xwhp9l")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(underline.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(underline.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			destroy_component(underline);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let showHint;
    	let labelOnTop;
    	let actualColor;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextField', slots, ['label']);
    	let { value = '' } = $$props;
    	let { color = 'primary' } = $$props;
    	let { label = '' } = $$props;
    	let { placeholder = '' } = $$props;
    	let { outlined = false } = $$props;
    	let { filled = false } = $$props;
    	let { dense = false } = $$props;
    	let { hint = '' } = $$props;
    	let { error = '' } = $$props;
    	let { prepend = '' } = $$props;
    	let { persistentHint = false } = $$props;
    	let { textarea = false } = $$props;
    	let { rows = 6 } = $$props;
    	let { select = false } = $$props;
    	let { autocomplete = false } = $$props;
    	let { noUnderline = false } = $$props;
    	let { bgColor = 'var(--app-bg-color)' } = $$props;
    	let { disabled = false } = $$props;
    	let { focused = false } = $$props;
    	let { klass = '' } = $$props;
    	let { style = '' } = $$props;

    	const toggleFocus = () => {
    		$$invalidate(1, focused = !focused);
    	};

    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	const writable_props = [
    		'value',
    		'color',
    		'label',
    		'placeholder',
    		'outlined',
    		'filled',
    		'dense',
    		'hint',
    		'error',
    		'prepend',
    		'persistentHint',
    		'textarea',
    		'rows',
    		'select',
    		'autocomplete',
    		'noUnderline',
    		'bgColor',
    		'disabled',
    		'focused',
    		'klass',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextField> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function textarea_1_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('label' in $$props) $$invalidate(4, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ('outlined' in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(7, filled = $$props.filled);
    		if ('dense' in $$props) $$invalidate(8, dense = $$props.dense);
    		if ('hint' in $$props) $$invalidate(9, hint = $$props.hint);
    		if ('error' in $$props) $$invalidate(10, error = $$props.error);
    		if ('prepend' in $$props) $$invalidate(11, prepend = $$props.prepend);
    		if ('persistentHint' in $$props) $$invalidate(24, persistentHint = $$props.persistentHint);
    		if ('textarea' in $$props) $$invalidate(12, textarea = $$props.textarea);
    		if ('rows' in $$props) $$invalidate(13, rows = $$props.rows);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('autocomplete' in $$props) $$invalidate(15, autocomplete = $$props.autocomplete);
    		if ('noUnderline' in $$props) $$invalidate(16, noUnderline = $$props.noUnderline);
    		if ('bgColor' in $$props) $$invalidate(17, bgColor = $$props.bgColor);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('klass' in $$props) $$invalidate(19, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		getColor,
    		Label,
    		Hint,
    		Underline,
    		value,
    		color,
    		label,
    		placeholder,
    		outlined,
    		filled,
    		dense,
    		hint,
    		error,
    		prepend,
    		persistentHint,
    		textarea,
    		rows,
    		select,
    		autocomplete,
    		noUnderline,
    		bgColor,
    		disabled,
    		focused,
    		klass,
    		style,
    		toggleFocus,
    		forwardEvents,
    		actualColor,
    		labelOnTop,
    		showHint
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('label' in $$props) $$invalidate(4, label = $$props.label);
    		if ('placeholder' in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ('outlined' in $$props) $$invalidate(6, outlined = $$props.outlined);
    		if ('filled' in $$props) $$invalidate(7, filled = $$props.filled);
    		if ('dense' in $$props) $$invalidate(8, dense = $$props.dense);
    		if ('hint' in $$props) $$invalidate(9, hint = $$props.hint);
    		if ('error' in $$props) $$invalidate(10, error = $$props.error);
    		if ('prepend' in $$props) $$invalidate(11, prepend = $$props.prepend);
    		if ('persistentHint' in $$props) $$invalidate(24, persistentHint = $$props.persistentHint);
    		if ('textarea' in $$props) $$invalidate(12, textarea = $$props.textarea);
    		if ('rows' in $$props) $$invalidate(13, rows = $$props.rows);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('autocomplete' in $$props) $$invalidate(15, autocomplete = $$props.autocomplete);
    		if ('noUnderline' in $$props) $$invalidate(16, noUnderline = $$props.noUnderline);
    		if ('bgColor' in $$props) $$invalidate(17, bgColor = $$props.bgColor);
    		if ('disabled' in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ('focused' in $$props) $$invalidate(1, focused = $$props.focused);
    		if ('klass' in $$props) $$invalidate(19, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(2, style = $$props.style);
    		if ('actualColor' in $$props) $$invalidate(25, actualColor = $$props.actualColor);
    		if ('labelOnTop' in $$props) $$invalidate(20, labelOnTop = $$props.labelOnTop);
    		if ('showHint' in $$props) $$invalidate(21, showHint = $$props.showHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error, persistentHint, hint, focused*/ 16778754) {
    			$$invalidate(21, showHint = error || (persistentHint ? hint : focused && hint));
    		}

    		if ($$self.$$.dirty & /*placeholder, focused, value*/ 35) {
    			$$invalidate(20, labelOnTop = placeholder || focused || (value || value === 0));
    		}

    		if ($$self.$$.dirty & /*color*/ 8) {
    			$$invalidate(25, actualColor = getColor(color));
    		}

    		if ($$self.$$.dirty & /*actualColor*/ 33554432) {
    			$$invalidate(2, style = `--color: ${actualColor}`);
    		}
    	};

    	return [
    		value,
    		focused,
    		style,
    		color,
    		label,
    		placeholder,
    		outlined,
    		filled,
    		dense,
    		hint,
    		error,
    		prepend,
    		textarea,
    		rows,
    		select,
    		autocomplete,
    		noUnderline,
    		bgColor,
    		disabled,
    		klass,
    		labelOnTop,
    		showHint,
    		toggleFocus,
    		forwardEvents,
    		persistentHint,
    		actualColor,
    		slots,
    		input_input_handler,
    		textarea_1_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			value: 0,
    			color: 3,
    			label: 4,
    			placeholder: 5,
    			outlined: 6,
    			filled: 7,
    			dense: 8,
    			hint: 9,
    			error: 10,
    			prepend: 11,
    			persistentHint: 24,
    			textarea: 12,
    			rows: 13,
    			select: 14,
    			autocomplete: 15,
    			noUnderline: 16,
    			bgColor: 17,
    			disabled: 18,
    			focused: 1,
    			klass: 19,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prepend() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prepend(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentHint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentHint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autocomplete() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autocomplete(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noUnderline() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noUnderline(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focused() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function edit(hyperlink) {
    	if (hyperlink.startsWith('/wiki/')) {
    		return 'https:/en.wikipedia.org' + hyperlink;
    	}

    	else if (!hyperlink.startsWith('http')) {
    		return 'https://en.wikipedia.org/wiki/' + hyperlink;
    	}

    	return hyperlink;
    }

    async function isWikipediaTopic(hyperlink) {
    	const url = edit(hyperlink);

    	if (url == null) {
    		console.log('NELL FALSE: ' + url);
    		return false; 
    	}

    	const resp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${hyperlink}&format=json&origin=*`);
    	const data = await resp.json(); 
    	if (data.query.pages[-1] != undefined) {
    		return false; 
    	}

    	if (!url.startsWith('https:/en.wikipedia.org/wiki/') && !url.startsWith('https://en.wikipedia.org/wiki/')) {
    		console.log('FALSE: ' + url);
    		return false; 
    	}

    	const nonoTopics = ['Special', 'Wikipedia', 'File', 'Category', 'Help'];

    	for (const topic of nonoTopics) {
    		if (url.includes(topic)) {
    			return false; 
    		}
    	}
        
    	if (url.search('#') != -1 || url.search('.svg') != -1 || url.search('.png') != -1 || url.search('.jpg') != -1) {
    		return false; 
    	}    

    	return true;
    }

    /* website/src/StartPage.svelte generated by Svelte v3.46.3 */
    const file = "website/src/StartPage.svelte";

    function create_fragment$1(ctx) {
    	let html;
    	let div;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let h2;
    	let t5;
    	let textfield0;
    	let updating_color;
    	let updating_value;
    	let t6;
    	let textfield1;
    	let updating_value_1;
    	let current;

    	function textfield0_color_binding(value) {
    		/*textfield0_color_binding*/ ctx[4](value);
    	}

    	function textfield0_value_binding(value) {
    		/*textfield0_value_binding*/ ctx[5](value);
    	}

    	let textfield0_props = {
    		class: " ",
    		filled: true,
    		label: "Starting Topic"
    	};

    	if (/*startColor*/ ctx[0] !== void 0) {
    		textfield0_props.color = /*startColor*/ ctx[0];
    	}

    	if (/*topicStart*/ ctx[1] !== void 0) {
    		textfield0_props.value = /*topicStart*/ ctx[1];
    	}

    	textfield0 = new TextField({ props: textfield0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield0, 'color', textfield0_color_binding));
    	binding_callbacks.push(() => bind(textfield0, 'value', textfield0_value_binding));
    	textfield0.$on("blur", /*blur_handler*/ ctx[6]);

    	function textfield1_value_binding(value) {
    		/*textfield1_value_binding*/ ctx[7](value);
    	}

    	let textfield1_props = {
    		class: "w-2",
    		label: "Ending Topic",
    		color: "primary"
    	};

    	if (/*topicEnd*/ ctx[2] !== void 0) {
    		textfield1_props.value = /*topicEnd*/ ctx[2];
    	}

    	textfield1 = new TextField({ props: textfield1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textfield1, 'value', textfield1_value_binding));

    	const block = {
    		c: function create() {
    			html = element("html");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Wikipedia Game (By yourself!)";
    			t1 = space();
    			p = element("p");
    			p.textContent = "In the wikipedia game, you try to go from one article to another only using the hyperlinks on the page, as fast as you can.";
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Enter First Topic";
    			t5 = space();
    			create_component(textfield0.$$.fragment);
    			t6 = space();
    			create_component(textfield1.$$.fragment);
    			attr_dev(h1, "class", "text-5xl");
    			add_location(h1, file, 29, 8, 728);
    			attr_dev(p, "class", "text-2xl ");
    			add_location(p, file, 30, 8, 794);
    			attr_dev(h2, "class", "text-xl");
    			add_location(h2, file, 32, 8, 954);
    			attr_dev(div, "class", "text-center font-sans mx-20");
    			add_location(div, file, 28, 4, 677);
    			attr_dev(html, "lang", "en");
    			add_location(html, file, 27, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, html, anchor);
    			append_dev(html, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(div, t3);
    			append_dev(div, h2);
    			append_dev(div, t5);
    			mount_component(textfield0, div, null);
    			append_dev(div, t6);
    			mount_component(textfield1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const textfield0_changes = {};

    			if (!updating_color && dirty & /*startColor*/ 1) {
    				updating_color = true;
    				textfield0_changes.color = /*startColor*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			if (!updating_value && dirty & /*topicStart*/ 2) {
    				updating_value = true;
    				textfield0_changes.value = /*topicStart*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield0.$set(textfield0_changes);
    			const textfield1_changes = {};

    			if (!updating_value_1 && dirty & /*topicEnd*/ 4) {
    				updating_value_1 = true;
    				textfield1_changes.value = /*topicEnd*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textfield1.$set(textfield1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield0.$$.fragment, local);
    			transition_in(textfield1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield0.$$.fragment, local);
    			transition_out(textfield1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html);
    			destroy_component(textfield0);
    			destroy_component(textfield1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StartPage', slots, []);
    	const dispatcher = createEventDispatcher();
    	let success = false;
    	let numTries = 10;
    	let startColor;
    	let tf = null;
    	let topicStart = null;
    	let topicEnd = null;

    	const isValid = async (topic, isStart, garb) => {
    		if (isStart) {
    			$$invalidate(0, startColor = "error");
    		}
    	};
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StartPage> was created with unknown prop '${key}'`);
    	});

    	function textfield0_color_binding(value) {
    		startColor = value;
    		$$invalidate(0, startColor);
    	}

    	function textfield0_value_binding(value) {
    		topicStart = value;
    		$$invalidate(1, topicStart);
    	}

    	const blur_handler = () => {
    		isValid(topicStart, true);
    	};

    	function textfield1_value_binding(value) {
    		topicEnd = value;
    		$$invalidate(2, topicEnd);
    	}

    	$$self.$capture_state = () => ({
    		TextField,
    		isWikipediaTopic,
    		createEventDispatcher,
    		dispatcher,
    		success,
    		numTries,
    		startColor,
    		tf,
    		topicStart,
    		topicEnd,
    		isValid
    	});

    	$$self.$inject_state = $$props => {
    		if ('success' in $$props) success = $$props.success;
    		if ('numTries' in $$props) numTries = $$props.numTries;
    		if ('startColor' in $$props) $$invalidate(0, startColor = $$props.startColor);
    		if ('tf' in $$props) tf = $$props.tf;
    		if ('topicStart' in $$props) $$invalidate(1, topicStart = $$props.topicStart);
    		if ('topicEnd' in $$props) $$invalidate(2, topicEnd = $$props.topicEnd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*topicStart, startColor*/ 3) {
    			if (topicStart != null) {
    				isValid(topicStart, true);
    			}
    		}
    	};

    	return [
    		startColor,
    		topicStart,
    		topicEnd,
    		isValid,
    		textfield0_color_binding,
    		textfield0_value_binding,
    		blur_handler,
    		textfield1_value_binding
    	];
    }

    class StartPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StartPage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* website/src/App.svelte generated by Svelte v3.46.3 */

    function create_fragment(ctx) {
    	let startpage;
    	let current;
    	startpage = new StartPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(startpage.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(startpage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(startpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(startpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(startpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ StartPage });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
