#!/usr/bin/env bash

#results=$(xdotool search --onlyvisible --class "TelegramDesktop")
results=$(xdotool search --onlyvisible --class "Bettergram")

text="$@"

text="$(echo $text | sed "s/<b>//g")"
text="$(echo $text | sed "s/<\/b>//g")"

echo "$text" | xclip -selection clipboard

milliseconds=20


	for id in $results
	do
			xdotool key --window $id ctrl+v
			#xdotool type --clearmodifiers --window $id --delay 0 "$text"
			if [ $? -ne 0 ] 
			then
	    		echo "this window doesnt work trying next one"
	    		break
	    	fi 
	    	xdotool key --window $id --delay $milliseconds Return
	    	echo "done"
	    	exit 0
	done	

