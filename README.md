# Magik Bundles — v0.9.12

Logical bundles for ComfyUI: collect nodes anywhere on the graph without moving them or changing their connections. A node can belong to several bundles.

## Install

1. Extract the archive into `ComfyUI/custom_nodes/`.
2. Confirm the layout is `ComfyUI/custom_nodes/magik_bundles/__init__.py` and `magik_bundles/js/`.
3. Restart ComfyUI and hard-refresh its browser page (`Ctrl+Shift+R` in Firefox).
4. Right-click the canvas or a node and open **Magik Bundles**. A compact floating toolbar is displayed on startup.

For an update, replace the existing `magik_bundles` folder rather than keeping two versions installed. Existing memberships remain compatible.

There are no additional Python packages, generation nodes, or pip installation steps.

## Everyday use

Right-click the canvas or a node → **Magik Bundles**.

- **Create bundle from selection** creates a named, coloured bundle from scattered selected nodes. With no selected nodes, the canvas menu creates an empty bundle; the node menu uses the right-clicked node.
- **Assign to bundles…** opens a searchable membership picker. It reports how many target nodes are already in each bundle. Click a bundle to add all targets; if all already belong, click to remove them.
- Each existing bundle has a submenu with **Focus bundle**, **Locate all members**, **Select all members**, **Browse members…**, **Locate next / previous member**, **Membership brush**, **Rename / colour…**, **Duplicate collection**, and **Delete bundle (keep nodes)**.
- When nodes are targeted, each bundle also offers **Add selection** and **Remove selection from bundle**, with current membership counts.
- **Clear bundle focus** and **Finish membership brush** appear when applicable.

If the right-clicked node is selected, the node menu acts on the full current selection. If it is not selected, it acts on that node alone. The canvas menu uses the current selection.

### Browse and search

**Manage / search bundles…** opens a temporary modal manager. It has search, bundle actions, expandable virtualised member lists, and **Previous / Next** navigation. Clicking a member, locating a bundle, selecting its members, or starting a brush closes the manager so you can work on the canvas. Close it with **Close** or **Esc**. The full manager is opened only on request; the separate floating toolbar provides quick access.

The first 15 bundles appear directly in the context menu. Larger collections use **Search all … bundles** or the manager, keeping menus short. Search matches bundle names and member titles, types, and IDs.

### Membership brush

Start **Membership brush** from a bundle's submenu. The canvas cursor becomes a crosshair. Click nodes to toggle membership without dragging them. Press **Esc** or use **Finish membership brush** in the canvas menu to finish. Switching graphs also ends the brush.

### Compact floating toolbar

The toolbar uses icons with hover tooltips and accessible labels. The bundle picker shows bundle names and member counts. Buttons create a bundle, open search/management, add/remove selected nodes, locate/select bundle members, navigate previous/next members, toggle the brush, and toggle highlighting.

Drag the **⠿** handle to move it. The bottom **scale slider** previews its percentage while dragging and applies the size on release. It changes the entire toolbar interface from **60% to 200%**, independent of graph zoom. Position, scale, visibility, and highlighting are remembered locally in this browser. Preferences are separate from workflow metadata.

**×** hides the toolbar. Restore it with right-click → **Magik Bundles → Show floating toolbar**. You can also hide it through the context menu.

### Layout, browser refresh, and bundle status

**⇅ / ⇆** switches the toolbar between horizontal and vertical layouts. Orientation is remembered in this browser and the existing scale slider works in both layouts.

**⟳** reloads the browser page using the same normal reload operation as F5. Save workflow edits before using it if you need them retained; browser/ComfyUI reload recovery follows the host's ordinary behavior.

**▤** expands or collapses the bundle-status panel; its expanded state is remembered. Each row shows its bundle name, node count, actual execution status, and a mode switch. Hover the status for counts of enabled, bypassed, and muted/other nodes.

Status badges use green for Enabled, purple for Bypassed, amber for Mixed, and grey for Empty.

- **Enabled:** all members are in normal execution mode.
- **Bypassed:** all members use ComfyUI bypass mode (Ctrl+B).
- **Mixed:** members have differing modes, or some are muted/in another mode.
- **Empty:** no members; the switch is disabled.

Click an enabled or mixed bundle's switch to bypass all its members. Click a bypassed bundle's switch to enable all members. This sets normal mode on every member, including previously muted ones. It does not restore a remembered per-node mode configuration. Shared nodes change mode in every bundle they belong to, and all affected statuses update. Bundle mode changes use host before/after-change notifications for undo tracking. The native node mode property is written directly; LiteGraph changeMode does not accept bypass mode.

The context-menu bundle submenu also includes **Bypass bundle / Enable bundle**. Status refreshes after graph changes, workflow loads, and Ctrl+B keyboard edits.

### Canvas feedback

All bundleed nodes have colour outlines by default, without altering their existing node colours. Nodes in multiple bundles show up to three nested colour outlines. **Disable bundle highlighting / Enable bundle highlighting** in the context menu toggles outlines globally; the **◉** toolbar button does the same. Small membership markers remain visible when outlines are disabled.

**Focus bundle** makes that bundle's outline thicker. **Clear bundle focus** clears the active bundle; ordinary default outlines remain. Hover the markers near a node's top-right corner to see its bundle names. Locating all widely scattered members can require a distant zoom; browse individual members for a close view.

Deleting a bundle keeps its nodes. Duplicating a collection creates another bundle with the same members; it does not duplicate nodes. Membership editing never changes execution mode, node position, or connections. The explicit bundle bypass switches change member node modes.

## Persistence, duplication, undo

Bundle edits call the graph's before/after change methods so the host can record them in workflow undo history. Bundle definitions live in `graph.extra.magik_bundles`, while each member carries a small copy of its bundle definitions in `node.properties.magik_bundles`.

This allows save/reload, node duplication, and normal workflow-aware clipboard copies to retain memberships without depending on numeric node IDs. Pasting nodes into another workflow brings their bundles along. Bundle identity uses a UUID: different bundles with the same name remain distinct. If the destination already contains that UUID, its definition wins. Empty bundles are retained in graph metadata.

An extension-free ComfyUI installation can still execute the ordinary workflow. Standard workflow JSON preserves the metadata; tools that discard node properties or graph extras may discard bundles.

## Scope and compatibility

This release bundles nodes within the currently displayed graph. Inside a subgraph, bundles apply to that graph's nodes; it does not create collections spanning several graph levels. Open dialogs close when the displayed graph changes.

The extension uses current ComfyUI extension hooks for context menus, commands, workflow loading, and node creation. Canvas drawing, selection/change notification, and membership brush interactions use the LiteGraph canvas API. Existing canvas callbacks are chained rather than replaced outright.

**Validation:** JavaScript/Python syntax checks, automated model tests, and a mocked DOM harness covering UI actions and simulated host state restoration. Full browser validation was blocked by an unavailable browser binary and a failed browser download. It has not been exercised against a running ComfyUI installation or the user's Firefox session. A very old frontend may lack the context-menu/command hooks; newer alternative renderers may draw markers differently. Verify the installed frontend before relying on a large workflow.

## Performance

No idle polling. Index rebuilding is scheduled once per animation frame after graph changes. Canvas markers iterate visible nodes, and expanded member lists render only a small window of rows. Graph edits rebuild the index in O(nodes + memberships); very large membership sets should be measured in the actual frontend.

## First live check

Right-click and create a bundle from two distant nodes. Confirm the compact toolbar is displayed and bundleed nodes have outlines by default. Add a third using Brush, then press Esc. Save and reload the workflow. Duplicate a member and check its membership. Rename the bundle and undo. Delete the bundle and undo. Finally, switch to a different workflow and back. The original nodes, connections, and execution should stay intact throughout.

## Files

- `__init__.py`: serves the frontend assets.
- `js/model.js`: validation, indexing, membership changes, persistence.
- `js/magik_bundles.js`: context menus, temporary manager, dialogs, navigation, canvas integration, and commands.
- `js/style.css`: scoped temporary manager/dialog styles.

Developer tests and validation notes are included in the archive under `validation/`. They are not loaded by ComfyUI.

Bundle summary rows remain on one line in both layouts: `bundle_name - XX`, a colour-only status indicator, and the toggle. Status text is available on hover and through accessible labels.

## Toolbar controls in v0.9.12

The top row ends with Hide, Collapse/Expand, Layout, Clear Queue, and Browser Refresh, in that order. Collapse keeps top-row icon buttons visible, hides the bundle picker, and hides controls below it; its state is remembered. The bundle-status expander sits at the left of its control row and Settings at the right.

Settings opens an inline child panel with four themes: Obsidian, Midnight, Paper, and Forest. Theme choice is saved locally and applies to the toolbar and extension dialogs. Bundle identity colours, execution-status colours, and the deep-blue reload button remain recognizable across themes.

The panel uses a top-left transform scale, with viewport-coordinate positioning and dragging. The scale slider commits on release to avoid changing its own geometry under the pointer. No CSS size/position animations are used.

The deep-blue Refresh and red Clear Queue buttons are both 58 × 56 CSS pixels (double the standard 29 × 28 toolbar icon size), before UI scaling. Refresh is the leftmost button and Clear Queue is the rightmost button. Clear Queue removes pending jobs using ComfyUI’s queue API; it does not interrupt the running job or delete history. Request failures are reported in the button tooltip.

Vertical layout uses approximately half-area refresh/clear buttons (41 × 40 px). Add, Remove, Locate, and Select share one row. The next row contains Status, Highlighting, Brush, and Settings. Previous/next member buttons are removed from the floating toolbar; individual navigation remains accessible through bundle menus and the member browser.

The header stays on one line, with Refresh first, then the drag handle and bundle controls, and Clear Queue last. Panel widths are 320 px vertically and 350 px horizontally, before UI scaling. On a viewport too narrow for the full scaled header, the panel permits scrolling instead of wrapping buttons onto another row.

The Choose Bundle dropdown occupies its own full-width row directly beneath the top icon row, in both orientations. Toolbar collapse hides this row.

The expanded bundle status panel grows and shrinks to fit all bundle rows, without a fixed height or an internal scrollbar. The toolbar retains viewport scrolling for very large bundle lists.

Refresh starts the row immediately below the top menu, beside the bundle selector. Highlighting and brush toggles share the available width, with 4px gaps to neighbouring controls.

Clear Queue matches the standard 28px button height and fills the remaining top-row width in both layouts.

Floating toolbar width is 262.5px horizontally and 240px vertically, before UI scaling (25% narrower).

## Active highlighting and All Bundles (v0.9.12)
Highlighting outlines only the active bundle. Each bundle remembers its highlighting toggle; selecting All Bundles highlights the union of bundleed nodes. All Bundles appears in the dropdown and status summary, counts each node once, and supports select, locate, and enable/bypass. It is a virtual collection: add/remove membership and brush editing require an individual bundle.
The membership brush uses a custom brush cursor only when the canvas cursor is default/auto. Text, resizing, connection, and other special cursors are preserved.

Brush clicks accept normal node-hover cursors while preserving special interactions. The brush cursor uses the same ✎ glyph as its toolbar button. Collapsed membership markers and outlines use the rendered collapsed width (`_collapsed_width`) instead of the expanded node width.

## Upgrade to Magik Bundles
Remove the previous extension folder before installing `magik_bundles` into `ComfyUI/custom_nodes`, then restart ComfyUI and hard-refresh the browser. Do not install both versions together. Earlier workflow membership and toolbar preferences migrate automatically; save each workflow after loading it to write the new data keys. Legacy identifiers are isolated in `js/legacy.js`; all current UI labels, functions, variables, CSS classes, commands, filenames and serialized fields use Bundle terminology.

## Vertical layout (v0.9.12)
The header is two rows: Drag / Create / Manage / Hide, then Collapse / Layout / Clear Queue (fills the last two columns). Refresh and Choose bundle remain together below the header. Actions form two rows: Add / Remove, then Locate / Select. The next controls form two rows: Status / Highlighting, then Brush / Settings. All rows have 4px gaps.

Vertical layout width is now 160px before scaling. Its control rows are Brush / Highlighting, then Status / Settings.

Hovering or keyboard-focusing a status name reveals its full text in a temporary name-only overlay. The row, status controls and toolbar dimensions stay fixed.

Vertical header rows are now Collapse / Layout / Refresh, then Drag / Create / Manage / Hide. Clear Queue starts the dropdown row. Collapsing the vertical toolbar shows only Collapse / Layout / Refresh.

Vertical first row is Drag / Collapse / Layout / Refresh, and remains draggable when collapsed. The second row is Create / Manage / Hide. Clear Queue uses the standard 28px button height in both layouts.

Vertical header: Drag / Collapse / Refresh, followed by Create / Manage / Hide / Layout. Collapsed mode shows only the first row.

## Horizontal baseline (v0.9.12)
Both layouts currently share the same 160px layout, row ordering and collapse behavior. Horizontal starts as a copy of the vertical layout. The layout toggle retains its independent preference for future horizontal-specific adjustments.

Horizontal layout transposes the control rows into columns, with upright icons and text. The control strip is 160px tall; collapsed mode keeps only the first column (Drag / Collapse / Refresh). Status and settings expand underneath it. Vertical layout remains 160px wide.

In horizontal mode, Hide Toolbar and Toggle Layout occupy a separate column immediately to the right of the other header controls.

The horizontal control strip is now 80px tall before scaling (66px content plus padding and borders). Expanded status and settings still fit their content.

Refresh is temporarily hidden only in horizontal layout; vertical keeps it. The scale control displays only its slider and percentage; the double-arrow decoration is removed. Horizontal Collapse fills the former refresh space.

Horizontal control-strip height is now 40px before scaling. Controls use compact two-row columns, smaller icons and a horizontal scale slider. Status and settings still expand to fit their content.

Horizontal strip height is 44px before scaling, a 10% increase from 40px.

Horizontal strip height is 50px before UI scaling.

Add/Remove Selected Nodes use matching SVG icons with consistent spacing. The horizontal dropdown column is 65px, half its previous width.

Horizontal Collapse and Refresh now share a far-right column, with Refresh below Collapse. Both remain accessible when collapsed, alongside the drag handle.

Horizontal Collapse/Refresh now sits immediately after the drag anchor, before Create/Manage and Hide/Layout.

Collapsed horizontal controls explicitly keep the drag anchor to the left of the Collapse/Refresh column.

Collapsed horizontal layout stacks Drag, Collapse, and Refresh vertically, with Drag at the top.

## Status popout (v0.9.12)
Status opens to the right of its toggle as a horizontal strip of vertical bundle cards. It follows toolbar dragging and scale changes, stays within the viewport, and hides when the toolbar is hidden or collapsed. Settings offers a persistent Vertical Status Text checkbox. Each card contains the coloured name, status indicator and enable/bypass control.

Status placement reserves the entire toolbar rectangle. It prefers the right side, then below, left or above; when space is limited it scrolls within the available area without overlapping toolbar controls.

## Bundle ordering
Drag a status card by its ⠿ handle and drop on the left or right half of another card to insert before or after it. Works in both toolbar layouts and with vertical text. All Bundles can also be moved. Keyboard users can focus a handle and press Alt+Left/Right. Order is saved in the workflow and shared with the dropdown; normal graph undo applies.

Vertical mode restores the inline status list from v0.8.12: one row per bundle, coloured name and node count, status colour, and enable/bypass button. Drag the name to reorder (or use Alt+Up/Down). Horizontal mode keeps its status popout and vertical cards.

Horizontal status-card widths, horizontal gaps and padding are reduced to one-quarter: standard cards 25px and vertical-text cards 9px. Full names remain available on hover. Vertical inline status is unchanged.

Status name and bypass buttons share the Show/Hide Status button design: matching heights, fonts, padding, border, radius, hover and focus styles for each orientation. Bundle colours remain on name buttons.

Horizontal status now uses horizontal widgets arranged in two rows, filled top-to-bottom by column. T includes All Bundles; there are floor(T/2) full columns, plus one partial column if T is odd. Vertical status remains unchanged. Names are upright in the horizontal widgets.

Horizontal status name displays are 27px wide, one-third of the former 81px. Other controls retain their dimensions; each grid column contracts to 76px. Full names remain available on hover.

Horizontal status grid is integrated into the main toolbar immediately before the scale slider. Its toggle shows/hides the grid, and collapse hides it. Vertical inline status is unchanged.

Show/Hide Status has a light outline whenever status is actually visible. The Hide Floating Toolbar icon is removed from both layouts; the context-menu visibility command remains available.

Horizontal Collapse sits below Drag, and Layout replaces Collapse above Refresh. Vertical width is two-thirds of 160px (106.6667px before scaling).

Change Layout is hidden when the horizontal toolbar is collapsed; it returns on expansion.

Horizontal header uses exactly three populated columns, removing the empty column left after moving Layout.
