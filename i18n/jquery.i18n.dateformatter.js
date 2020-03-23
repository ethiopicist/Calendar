$.extend($.i18n.parser.emitter, {
	
	// 1 = year; 2 = month; 3 = date; 4 = day
	datestring: function(nodes){

		var dateString;

		if(nodes[0] == 'eth'){

			switch($.i18n().locale){

				case 'am-eth':
				case 'ti-eth':
				case 'gez-eth':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + '፣ ' +
						$.i18n('ethMonth'+nodes[2]+'long') + ' ' +
						nodes[3] + ' ቀን ' +
						nodes[1]
					);
					break;

				case 'am-lat':
				case 'ti-lat':
				case 'gez-lat':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + ', ' +
						$.i18n('ethMonth'+nodes[2]+'long') + ' ' +
						nodes[3] + ' qan ' +
						nodes[1]
					);
					break;

				case 'om':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + ', ' +
						$.i18n('ethMonth'+nodes[2]+'long') + ' ' +
						nodes[3] + ', ' +
						nodes[1]
					);
					break;

			}

		}
		else if(nodes[0] == 'wes'){

			switch($.i18n().locale){

				case 'am-eth':
				case 'ti-eth':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + '፣ ' +
						$.i18n('greMonth'+nodes[2]+'long') + ' ' +
						nodes[3] + ' ቀን ' +
						nodes[1]
					);
					break;
				
				case 'fr':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + ' ' +
						nodes[3] + ' ' +
						$.i18n('greMonth'+nodes[2]+'long') + ' ' +
						nodes[1]
					);
					break;

				case 'pl':
					dateString = (
						$.i18n('day'+nodes[4]+'long') + ' ' +
						nodes[3] + ' ' +
						$.i18n('greMonth'+nodes[2]+'long-gen') + ' ' +
						nodes[1]
					);
					break;

				default:
					dateString = (
						$.i18n('day'+nodes[4]+'long') + ', ' +
						$.i18n('greMonth'+nodes[2]+'long') + ' ' +
						nodes[3] + ', ' +
						nodes[1]
					);

			}
		
		}

		return dateString;
	}
});