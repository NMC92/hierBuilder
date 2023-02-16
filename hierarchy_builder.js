function copyToClipboard(text) 
{
	function success(value)
	{
		//alert('Copied!');
		console.log('Copied!');
		//console.log('Resolved: ', value);
	}
	function error(err)
	{
		//alert('Error: ' + err);
		console.error('Error: ', err);
	}
	
	if(navigator.clipboard)
	{ 	// default: modern asynchronous API
		console.log('Attempting to copy:');
		console.log(text);
		return navigator.clipboard.writeText(text).then(success, error).catch(error);
	}
	else if(window.clipboardData && window.clipboardData.setData)
	{ 	// for IE11
		window.clipboardData.setData('Text', text);
		return Promise.resolve();
	}
	else
	{
		// workaround: create dummy input
		const input = h('input', { type: 'text' });
		input.value = text;
		document.body.append(input);
		input.focus();
		input.select();
		document.execCommand('copy');
		input.remove();
		return Promise.resolve();
	}
}

function onlyUnique(value, index, self) 
{
	return self.indexOf(value) === index;
}

function nonUnique(value, index, self) 
{
	return self.indexOf(value) !== index;
}

function cloneArray(sourceArray, destinationArray)
{
	return(JSON.parse(JSON.stringify(sourceArray)));
}

$(function()
{
	function startBuild(missingEls, tempAdminLvls, r)
	{
		let children = missingEls.filter(missingEl => tempAdminLvls.at(-1).split('-').find(elem => elem === missingEl.Feature.properties.admin_level) !== undefined),
		parents = global.filter(el => el.Feature.properties.admin_level === tempAdminLvls.at(-2)), len1 = parents.length, len2 = children.length, count1 = 0, count2 = 0;
		
		if(children.length === 0)
			return;
		
		while(count1 < len1)
		{
			let par = parents[count1];
			
			while(count2 < len2)
			{
				let chi = children[count2];
				
				//if(parseInt(chi.Id.split('/')[1]) === 13244400 && parseInt(par.Id.split('/')[1]) === 111257)
					//debugger;
				
				let indexAdminLevelChild = tempAdminLvls.indexOf(tempAdminLvls.find(tempAdminLvl => tempAdminLvl.includes(chi.Polygon.properties.admin_level))),
				indexAdminLevelParent = tempAdminLvls.indexOf(tempAdminLvls.find(tempAdminLvl => tempAdminLvl === par.Polygon.properties.admin_level));
				
				if(indexAdminLevelParent - indexAdminLevelChild !== -1/* || (tempAdminLvls.length < adminLevelsAll.length && (!tempAdminLvls.at(-1).includes(chi.Polygon.properties.admin_level) || adminLevelsAll.indexOf(adminLevelsAll.find(adminLevelAll => adminLevelAll.includes(par.Polygon.properties.admin_level))) - adminLevelsAll.indexOf(adminLevelsAll.find(adminLevelAll => adminLevelAll.includes(chi.Polygon.properties.admin_level))) >= -1 && r === 1))*/)
				{
					++count2;
					continue;
				}
				if((r === 0 && chi.Polygon.properties['@relations'] !== undefined && chi.Polygon.properties['@relations'].find(el3 => el3.rel === parseInt(par.Id.split('/')[1])) !== undefined) || r === 1 && turf.booleanPointInPolygon(chi.Geometry, par.Polygon.geometry))
				{
					if(checkedChildren.includes(chi.Id.split('/')[1]) && r === 0)
					{
						let existingElement = hierarchy.find(el => el.Id_Child === chi.Id);
						existingElement.AdminLevel_Parent += `, ${par.Polygon.properties.admin_level}`;
						existingElement.CountryCode_Parent += `, ${countryCode}`;
						existingElement.Id_Parent += `, ${par.Polygon.properties['@id']}`;
						existingElement.Name_Parent += `, ${(par.Polygon.properties.name.includes(par.Polygon.properties["name:en"]) || par.Polygon.properties["name:en"] === undefined)
							? (par.Polygon.properties.name || par.Polygon.properties["name:en"]) 
							: par.Polygon.properties.name + ' / ' + par.Polygon.properties["name:en"]}`;
						console.log('Multiple relation detected in element:');
						console.log(`${existingElement.Name_Child}(${existingElement.AdminLevel_Child} - ${chi.Id.split('/')[1]}) in ${(par.Polygon.properties.name.includes(par.Polygon.properties["name:en"]) || par.Polygon.properties["name:en"] === undefined)
							? (par.Polygon.properties.name || par.Polygon.properties["name:en"]) 
							: par.Polygon.properties.name + ' / ' + par.Polygon.properties["name:en"]}(${par.Polygon.properties.admin_level} - ${par.Polygon.properties['@id'].split('/')[1]})`);
					}
					else if(checkedChildren.includes(chi.Id.split('/')[1]) && r === 1)
					{
						console.log("!");
						let existingElement = hierarchy.find(el => el.Id_Child === chi.Id);
						existingElement.AdminLevel_Parent += `, ${par.Polygon.properties.admin_level}`;
						existingElement.CountryCode_Parent += `, ${countryCode}`;
						existingElement.Id_Parent += `, ${par.Polygon.properties['@id']}`;
						existingElement.Name_Parent += `, ${(par.Polygon.properties.name.includes(par.Polygon.properties["name:en"]) || par.Polygon.properties["name:en"] === undefined)
							? (par.Polygon.properties.name || par.Polygon.properties["name:en"]) 
							: par.Polygon.properties.name + ' / ' + par.Polygon.properties["name:en"]}`;
						console.log('Multiple relation detected in element:');
						console.log(`${existingElement.Name_Child}(${existingElement.AdminLevel_Child} - ${chi.Id.split('/')[1]}) in ${(par.Polygon.properties.name.includes(par.Polygon.properties["name:en"]) || par.Polygon.properties["name:en"] === undefined)
							? (par.Polygon.properties.name || par.Polygon.properties["name:en"]) 
							: par.Polygon.properties.name + ' / ' + par.Polygon.properties["name:en"]}(${par.Polygon.properties.admin_level} - ${par.Polygon.properties['@id'].split('/')[1]})`);
					}
					else
					{
						let jsonInitChild = jsonCountryInit.find(child => child['@id'] === chi.Id), jsonInitParent = jsonCountryInit.find(parent => parent['@id'] === par.Id);
						hierarchy.push(
						{
							AdminLevel_Child:jsonInitChild.admin_level, AdminLevel_Parent:jsonInitParent.admin_level,
							CountryCode_Child:countryCode, CountryCode_Parent:countryCode,
							Id_Child:chi.Id, Id_Parent:par.Id,
							Name_Child:(jsonInitChild.name.includes(jsonInitChild["name:en"]) || jsonInitChild["name:en"] === undefined)
							? (jsonInitChild.name || jsonInitChild['name:en'])
							: jsonInitChild.name + ' / ' + jsonInitChild["name:en"],
							Name_Parent:(jsonInitParent.name.includes(jsonInitParent["name:en"]) || jsonInitParent["name:en"] === undefined)
							? (jsonInitParent.name || jsonInitParent["name:en"])
							: jsonInitParent.name + ' / ' + jsonInitParent["name:en"]
						});
						checkedChildren.push(chi.Id.split('/')[1]);
						console.log(`${jsonInitChild.name}(${jsonInitChild.admin_level} - ${chi.Id.split('/')[1]}) in ${jsonInitParent.name}(${jsonInitParent.admin_level} - ${par.Id.split('/')[1]})`);
					}
				}
				++count2;
			};
			++count1;
			count2=0;
		}
	}
	
	let countryCode = 'AR', adminLevels = ['0', '1', '2'], done = false, global = [], hierarchy = [], checkedChildren = [], lastAdminLevel = parseInt(adminLevels.at(-1)), repeated = [], unnamed = [], jsonCountryInit, skip = 0, initialHierarchyCounter;
	
	$.getJSON(countryCode+'.geojson', function(polygons)
	{	
		adminLevels = adminLevels.concat([..._.keys(_.countBy(polygons.features, function(data) { return data.properties.admin_level; }))]).filter(onlyUnique), adminLevelsAll = [], tempAdminLvls = [], idsGlobal = [];
		tempAdminLvls = cloneArray(adminLevels, tempAdminLvls);
		adminLevelsAll = cloneArray(tempAdminLvls, adminLevelsAll);
		$.getJSON('labels.geojson', function(labels)
		{
			$.getJSON(`${countryCode}-init.json`, function($jsonCountryInit) 
			{
				jsonCountryInit = $jsonCountryInit;
				jsonCountryInit.forEach((element, index) =>
				{
					if(element.name === undefined || element.name === '')
					{
						element.name = '#Unnamed#';
						//unnamed.push(element['@id']);
					}
					if(idsGlobal.includes(element['@id']))
						repeated.push(element['@id']);
					else
						idsGlobal.push(element['@id']);
				});
				
				if((repeated.length + unnamed.length) > 0)
				{
					//polygons.features.filter(el => unnamed.includes(el.id)).forEach((elem, index) => elem.properties.name = '#Unnamed#')
					//console.log(JSON.stringify(polygons));
					debugger;
				}
				labels.features.forEach((feature, index) =>
				{
					//if(!idsGlobal.includes(feature.id))
						//return;
					global.push({ Feature: feature, Geometry: feature.geometry, Id: feature.id, Index: index, Polygon: polygons.features[index]});
				});
				$.getJSON(countryCode + '.json', function($jsonCountry) 
				{
					jsonCountry = $jsonCountry;
					jsonCountry.forEach((element, index) =>
					{
						hierarchy.push(
						{
							AdminLevel_Child:$jsonCountry[index].AdminLevel_Child, AdminLevel_Parent:$jsonCountry[index].AdminLevel_Parent,
							CountryCode_Child:$jsonCountry[index].CountryCode_Child, CountryCode_Parent:$jsonCountry[index].CountryCode_Parent,
							Id_Child:$jsonCountry[index].Id_Child, Id_Parent:$jsonCountry[index].Id_Parent,
							Name_Child:$jsonCountry[index].Name_Child, Name_Parent:$jsonCountry[index].Name_Parent
						});
						checkedChildren.push(element.Id_Child.split('/')[1]);
						idsGlobal.push(element.Id_Child.split('/')[1]);
					});
					initialHierarchyCounter = hierarchy.length;
					parentlessElements = jsonCountryInit.filter(elem => hierarchy.find(elem2 => elem2.Id_Child === elem['@id']) === undefined);
					const toFindDuplicates = checkedChildren => checkedChildren.filter((item, index) => checkedChildren.indexOf(item) !== index); 
					const duplicateElements = toFindDuplicates(checkedChildren);

					if(duplicateElements.length > 0)
						console.log("Duplicate elements present...\n"+duplicateElements);
					else if(parentlessElements.length === 0 || parentlessElements.length === 1 && parseInt(parentlessElements[0].admin_level) === 2)
					{
						console.log('Hierarchy complete!');
						return;
					}
					else
						console.log('Missing elements...');
					for(let r = 0; r < 2; r++)
					{
						if(hierarchy.length > initialHierarchyCounter)
						{
							let nonAddedElements = jsonCountryInit.filter(elem => hierarchy.find(elem2 => elem2.Id_Child === elem['@id']) === undefined);
							if(nonAddedElements.length === 1/* || (nonAddedElements.length === 2 && parseInt(lastAdminLevel) === 4)*/)
							{
								console.log('Hierarchy complete!');
								done = true;
								break;
							}
						}
						if(r === 0)
							console.log("Running builder with relations.");
						else
							console.log("Running builder with labels.");
						for(let i = adminLevels.length-1; i > lastAdminLevel; i--)//traverse all possible parent-descendant combos, since some children might have a different parent other than n-1 admin level
						{
							/*if(r < 1 || skip > 0)
							{
								if(r === 1)
								{
									skip--;
									console.log(`Skipping skip=${skip} and hierarchy:\n${tempAdminLvls}`);
								}
								tempAdminLvls[tempAdminLvls.length-2] = tempAdminLvls.at(-2) + '-' + tempAdminLvls.pop(-1);
								continue;
							}*/
							if(hierarchy.length > initialHierarchyCounter)
							{
								let nonAddedElements = jsonCountryInit.filter(elem => hierarchy.find(elem2 => elem2.Id_Child === elem['@id']) === undefined);
								if(nonAddedElements.length === 1/* || nonAddedElements.length === 2 && parseInt(lastAdminLevel) === 3*/)
								{
									console.log('Hierarchy completed!');
									done = true;
									break;
								}
							}
							if(i === lastAdminLevel)
								break;
							console.log(`Running builder for hierarchy:\n${tempAdminLvls}`);
							if(r === 0)
								startBuild(global.filter(el => checkedChildren.includes(el.Id.split('/')[1]) === false && el.Feature.properties['@relations'] !== undefined), tempAdminLvls, r);
							else
								startBuild(global.filter(el => checkedChildren.includes(el.Id.split('/')[1]) === false), tempAdminLvls, r);
							tempAdminLvls[tempAdminLvls.length-2] = tempAdminLvls.at(-2) + '-' + tempAdminLvls.pop(-1);
						}
						if(done)
							break;
						i = 0;
						tempAdminLvls = cloneArray(adminLevelsAll, tempAdminLvls);
					}
					slicedHierarchy = hierarchy.slice(initialHierarchyCounter, hierarchy.length);
					copyToClipboard(JSON.stringify(slicedHierarchy).slice(1, -1));
					console.log('Finished!');
				});
			});
		});
	});
});
